import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier

def train_model():
    print("Training Random Forest model...")
    # Dummy data for demonstration
    # Features: [age, income, gpa, previous_dropouts, network_risk]
    X = np.array([
        [18, 500, 3.5, 0, 0.1],
        [22, 1200, 2.0, 1, 0.8],
        [19, 800, 3.8, 0, 0.2],
        [25, 300, 1.5, 2, 0.9],
    ])
    # Labels: 0 (No Risk), 1 (Risk)
    y = np.array([0, 1, 0, 1])

    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X, y)
    
    # Save the model
    os.makedirs(os.path.dirname(os.path.abspath(__file__)) + '/models', exist_ok=True)
    model_path = os.path.dirname(os.path.abspath(__file__)) + '/models/rf_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
