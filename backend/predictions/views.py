from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import os
from .models import PredictionResult
from predictions.machine_learning.zone_mapper import coordinate_to_zone

@api_view(['POST'])
def receive_prediction(request):
   
    return Response({"message": "Predictions received successfully"}, status=201)

@api_view(['GET'])
def map_view_data(request):
    """
    Returns rhino and elephant coordinates for the latest prediction batch.
    """
    latest_timestamp = (
        PredictionResult.objects
        .order_by('-timestamp')
        .values_list('timestamp', flat=True)
        .first()
    )

    if not latest_timestamp:
        return Response({
            "rhinos": [],
            "elephants": [],
            "latest_timestamp": None
        })

    results = PredictionResult.objects.filter(
        timestamp=latest_timestamp,
        species__in=['rhino', 'elephant']
    )

    rhinos, elephants = [], []

    for row in results:
        entry = {
            "id": row.animal_id,
            "latitude": row.latitude,
            "longitude": row.longtitude,
        }
        if row.species.lower() == 'rhino':
            rhinos.append(entry)
        elif row.species.lower() == 'elephant':
            elephants.append(entry)

    return Response({
        "rhinos": rhinos,
        "elephants": elephants,
        "latest_timestamp": latest_timestamp
    })


@api_view(['GET'])
def get_xgb_results(request):
    """
    Returns all XGB predictions for the most recent timestamp.
    """
    latest_ts = (
        PredictionResult.objects
        .order_by('-timestamp')
        .values_list('timestamp', flat=True)
        .distinct()
        .first()
    )

    if not latest_ts:
        return Response({"xgb_results": []})

    recent_preds = PredictionResult.objects.filter(timestamp=latest_ts)
    data = [
        {
            "id": pred.id,
            "species": pred.species,
            "prediction": pred.xgb_prediction,
            "latitude": pred.latitude,
            "longtitude": pred.longtitude,
            "timestamp": pred.timestamp,
        }
        for pred in recent_preds
    ]

    return Response({"xgb_results": data})


@api_view(['GET'])
def get_image_results(request):
    """
    Returns image classification results for the most recent poacher detection.
    """
    recent_poacher = (
        PredictionResult.objects
        .filter(xgb_prediction="poacher")
        .order_by('-timestamp')
        .first()
    )
    if not recent_poacher:
        return Response({
            "message": "Camera Trap Off, No Poachers Detected For Now",
        })

    all_with_ts = PredictionResult.objects.filter(timestamp=recent_poacher.timestamp)
    results = []

    for row in all_with_ts:
        if row.image_class_prediction and row.image_path:
            try:
                relative_path = os.path.relpath(row.image_path, settings.MEDIA_ROOT).replace("\\", "/")
                image_url = f"{settings.MEDIA_URL}{relative_path}"
            except Exception:
                image_url = ""  # fallback if conversion fails

            results.append({
                "class_name": row.image_class_prediction,
                "probability": row.probability,
                "zone": coordinate_to_zone(row.latitude, row.longtitude),
                "datetime": row.timestamp,
                "image_url": image_url,
            })

    return Response({"image_results": results})


@api_view(['POST'])
def validate_poacher(request):
    """
    Updates the latest animal detection (elephant/rhino) to 'poacher' classification.
    """
    latest = (
        PredictionResult.objects
        .filter(image_class_prediction__in=["elephant", "rhino"])
        .order_by('-timestamp')
        .first()
    )

    if not latest:
        return Response({"message": "No valid record to update"}, status=404)

    latest.image_class_prediction = "poacher"
    latest.save()

    return Response({"message": "Image classification updated to poacher"})

@api_view(['GET'])
def get_poaching_history(request):
    """
    Returns latest poaching detections (with all relevant fields).
    """
    # Filter for poacher predictions, latest 20 entries
    poaching_detections = (
        PredictionResult.objects
        .filter(xgb_prediction="poacher")
        .order_by('-timestamp')[:20]
    )

    results = []
    for row in poaching_detections:
        try:
            relative_path = os.path.relpath(row.image_path, settings.MEDIA_ROOT).replace("\\", "/")
            image_url = f"{settings.MEDIA_URL}{relative_path}"
        except Exception:
            image_url = ""

        results.append({
            "id": row.id,
            "timestamp": row.timestamp,
            "species": row.species,
            "xgb_prediction": row.xgb_prediction,
            "image_class_prediction": row.image_class_prediction,
            "image_url": image_url,
            "zone": coordinate_to_zone(row.latitude, row.longtitude),
            "latitude": row.latitude,
            "longtitude": row.longtitude,
            "pred_probability": row.probability
            
        })

    return Response({"poaching_detections": results})

@api_view(['GET'])
def admin_notifications(request):
    """
    Admin notifications:
    Shows both XGB anomalies + Image-based poacher detections.
    """
    latest_xgb = (
        PredictionResult.objects
        .filter(xgb_prediction="poacher")
        .order_by('-timestamp')
        .first()
    )

    latest_img = (
        PredictionResult.objects
        .filter(image_class_prediction="poacher")
        .order_by('-timestamp')
        .first()
    )

    notifications = []

    if latest_xgb:
        notifications.append({
            "type": "xgb",
            "message": "Movement anomaly detected",
            "timestamp": latest_xgb.timestamp
        })

    if latest_img:
        notifications.append({
            "type": "image",
            "message": "Poacher detected",
            "timestamp": latest_img.timestamp
        })

    if not notifications:
        return Response({
            "has_notification": False,
            "notifications": []
        })

    return Response({
        "has_notification": True,
        "notifications": notifications
    })


@api_view(['GET'])
def ranger_notifications(request):
    """
    Ranger notifications:
    Only shows Image-based poacher detections (camera traps).
    """
    latest_img = (
        PredictionResult.objects
        .filter(image_class_prediction="poacher")
        .order_by('-timestamp')
        .first()
    )

    if not latest_img:
        return Response({
            "has_notification": False,
            "notifications": []
        })

    return Response({
        "has_notification": True,
        "notifications": [
            {
                "type": "image",
                "message": "Poacher detected",
                "timestamp": latest_img.timestamp
            }
        ]
    })
