from django.core.management.base import BaseCommand
from time import sleep
from predictions.models import AnimalMovement, PredictionResult
from predictions.utils.predict_tools import run_xgboost_on_batch, classify_image
from predictions.machine_learning.zone_mapper import coordinate_to_zone
import requests
import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

API_URL = "http://127.0.0.1:8000/api/receive-prediction/"

class Command(BaseCommand):
    help = "Process AnimalMovement batches by timestamp every 60 seconds"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("EcoGuard Batch Monitor Starting..."))
        # Replace Animal Movement with actual DataBase table in production
        timestamps = (
            AnimalMovement.objects
            .values_list('datetime', flat=True)
            .distinct()
            .order_by('datetime')
        )

        for ts in timestamps:
            self.stdout.write(f"\nProcessing timestamp: {ts}")
            batch_predictions = run_xgboost_on_batch(ts)
            

            if not batch_predictions:
                self.stdout.write(f"DEBUG: batch_predictions = {batch_predictions}")
            else:
                self.stdout.write(self.style.WARNING(f"{len(batch_predictions)} predictions in batch"))

                payload = []

                for row in batch_predictions:
                    # for demo purposes
                    try:
                        zone = coordinate_to_zone(row['latitude'], row['longtitude'])
                        result = {}

                        if row['prediction'] == 1:
                            try:
                                result = classify_image(zone, row['datetime'])
                                print(f"Results: {result}")
                            except FileNotFoundError:
                                result = {}

                        # Save prediction to DB after result is defined
                        PredictionResult.objects.create(
                            timestamp=row.get("datetime"),
                            animal_id=row.get("animal_id"),
                            species=row.get("species"),
                            xgb_prediction="poacher" if row.get("prediction") == 1 else "normal",
                            latitude=row.get("latitude"),
                            longtitude=row.get("longtitude"),
                            image_path=result.get("image_path"),
                            image_class_prediction=result.get("class_name"),
                            probability=result.get("probability"),
                        )

                        self.stdout.write(self.style.SUCCESS(
                            f"Saved prediction for {row['species']} ({row['animal_id']}) — {row['prediction']}"
                        ))

                        # Add to payload to POST
                        payload.append({
                            "animal_id": row.get("animal_id"),
                            "species": row.get("species"),
                            "datetime": str(row.get("datetime")),
                            "timestamp": str(row.get("datetime")),
                            "latitude": row.get("latitude"),
                            "longtitude": row.get("longtitude"),
                            "prediction": "poacher" if row.get("prediction") == 1 else "normal",
                            "zone": zone,
                            "image_url": result.get("image_path"),
                            "class_name": result.get("class_name"),
                            "probability": result.get("probability")
                        })

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error: {e}"))

                # Send all predictions in one POST request after the loop
                response = requests.post(API_URL, json=payload)
                if response.status_code in (200, 201):
                    self.stdout.write(self.style.SUCCESS("Batch predictions posted successfully"))
                else:
                    self.stdout.write(self.style.WARNING(
                        f"⚠️ Failed to post batch predictions: {response.status_code}, {response.text}"
                    ))

            self.stdout.write("Waiting 60 seconds before next batch...\n")
            sleep(60)
