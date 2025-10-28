import pickle
import tensorflow as tf
import numpy as np

def load_model(path="predictions/machine_learning/models/xgboost_poacher_model.pkl"):
    with open(path, "rb") as f:
        model = pickle.load(f)
        return model

def run_prediction(model, data):
    return model.predict(data)


    
path= 'C:/Users/HP/Documents/EcoGuard Trials/movement data/saved models/final_ensemble_model.keras'
ensemble_model = tf.keras.models.load_model(path)
class_names = ['elephant', 'poacher', 'rhino']
def image_classifier(image):
    return ensemble_model.predict(image)