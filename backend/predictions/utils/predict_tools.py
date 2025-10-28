import os
import pandas as pd
import pickle
from django.conf import settings
from predictions.models import AnimalMovement
from predictions.machine_learning.preprocessor import data_prep, preprocess_image
from predictions.machine_learning.predictor import image_classifier

# Load once
with open(os.path.join(settings.BASE_DIR, "predictions/machine_learning/models/xgboost_poacher_model.pkl"), 'rb') as file:
    xgb_model = pickle.load(file)

class_names = ['elephant', 'poacher', 'rhino']


def run_xgboost_on_batch(ts):
    results = []
    qs = AnimalMovement.objects.filter(datetime=ts)
    df_raw = pd.DataFrame(list(qs.values()))
    if df_raw.empty:
        return []

    try:
        df_preprocessed = data_prep(df_raw)
        preds = xgb_model.predict(df_preprocessed)
        df_raw['prediction'] = preds

        df_print = df_raw[['datetime', 'species', 'prediction']]
        print(df_print.head())

        # Return all predictions, not only poachers
        for _, row in df_raw.iterrows():
            results.append({
                "animal_id": row["animal_id"],
                "species": row["species"],
                "datetime": row["datetime"],
                "latitude": row["latitude"],
                "longtitude": row["longtitude"],
                "prediction": int(row["prediction"]),
            })
    except Exception as e:
        print(f"[XGBoost Error] {e}")

    return results



def classify_image(zone, datetime_str):
    dt_obj = pd.to_datetime(datetime_str)
    img_name = dt_obj.strftime('%Y-%m-%d_%H-%M-%S') + ".jpg"
    image_path = os.path.join(settings.BASE_DIR, 'media', 'camera_zones', zone, img_name)

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    img_tensor = preprocess_image(image_path)
    predictions = image_classifier(img_tensor)

    class_index = predictions.argmax()
    class_name = class_names[class_index]
    probability = float(predictions[0][class_index])

    return {
        "zone": zone,
        "datetime": datetime_str,
        "image_path": image_path,
        "class_name": class_name,
        "probability": probability
    }
