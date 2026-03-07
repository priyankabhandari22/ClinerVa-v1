"""
train_model.py — Clinerva ML Model Trainer
Trains a Random Forest classifier on training_data.csv.
Saves model + scaler as .pkl files.
Requires: scikit-learn, pandas, joblib
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib

def train():
    # ── Step 1: Load ─────────────────────────────────────────────────────────
    df = pd.read_csv("training_data.csv")
    X = df.drop("enrollment_success", axis=1)
    y = df["enrollment_success"]
    feature_names = X.columns.tolist()

    print(f"Loaded {len(df)} training samples")
    print(f"Features: {feature_names}")
    print(f"Class distribution:\n{y.value_counts().to_string()}\n")

    # ── Step 2: Split ─────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # ── Step 3: Scale ─────────────────────────────────────────────────────────
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    # ── Step 4: Train Random Forest ───────────────────────────────────────────
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=5,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train_scaled, y_train)
    print("Model training complete.\n")

    # ── Step 5: Evaluate ──────────────────────────────────────────────────────
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    acc     = accuracy_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_prob)

    print(f"Accuracy:     {acc * 100:.1f}%")
    print(f"AUC-ROC Score: {auc_roc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # ── Step 6: Feature Importance ────────────────────────────────────────────
    print("Feature Importances:")
    importances = model.feature_importances_
    for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
        print(f"  {name}: {imp * 100:.1f}%")

    # ── Step 7: Save ──────────────────────────────────────────────────────────
    joblib.dump(model,  "clinerva_model.pkl")
    joblib.dump(scaler, "clinerva_scaler.pkl")
    print("\nModel saved as clinerva_model.pkl")
    print("Scaler saved as clinerva_scaler.pkl")

    return acc, auc_roc

if __name__ == "__main__":
    train()
