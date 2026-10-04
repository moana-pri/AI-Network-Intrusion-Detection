import pandas as pd
from sklearn.ensemble import IsolationForest


# Load ML-ready data
data = pd.read_csv("ml_ready_data.csv")


# Features used by the model
features = data[
    [
        "Protocol",
        "Source Port",
        "Destination Port",
        "Packet Size",
        "SYN",
        "ACK",
        "FIN"
    ]
]


# Create Isolation Forest model
model = IsolationForest(
    contamination=0.05,
    random_state=42
)


# Train the model
model.fit(features)


# Predict anomalies
data["Prediction"] = model.predict(features)


# Convert prediction into readable result
data["Result"] = data["Prediction"].apply(
    lambda x: "Anomaly" if x == -1 else "Normal"
)


# Count results
normal_count = (data["Result"] == "Normal").sum()
anomaly_count = (data["Result"] == "Anomaly").sum()


print("ML anomaly detection complete.")
print()
print("Normal traffic :", normal_count)
print("Anomalies      :", anomaly_count)


print("\nDetected anomalies:")
print(
    data[data["Result"] == "Anomaly"][
        [
            "Protocol",
            "Source Port",
            "Destination Port",
            "Packet Size",
            "SYN",
            "ACK",
            "FIN",
            "Result"
        ]
    ]
)


# Save results
data.to_csv("ml_results.csv", index=False)

print("\nResults saved to ml_results.csv")