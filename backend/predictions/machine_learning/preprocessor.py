import pandas as pd
import joblib
import tensorflow as tf
import numpy as np
import cv2  # Added for fallback processing

# Load saved scaler and encoders
scaler = joblib.load("predictions/machine_learning/mappings/standard_scaler.pkl")
le_sex = joblib.load("predictions/machine_learning/mappings/label_encoder_sex.pkl")
le_tod = joblib.load("predictions/machine_learning/mappings/label_encoder_tod.pkl")

def data_prep(df):
    data = df.copy()
    # Drop unwanted columns
    data = data.drop(columns=['species', 'animal_id', 'id',
                             'datetime', 'latitude', 'longtitude'], errors='ignore')
    
    num_cols = data.select_dtypes(include=['number']).columns
    data[num_cols] = scaler.transform(data[num_cols])
    
    # Use loaded label encoders
    data['sex'] = le_sex.transform(data['sex'].astype(str))
    data['ToD'] = le_tod.transform(data['ToD'].astype(str))
    
    return data

def preprocess_image(image):
    image = cv2.imread(image)
    img_resized = cv2.resize(image, (224, 224))
    img_array = np.expand_dims(img_resized, axis=0)
    
    return img_array
