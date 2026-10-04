import pandas as pd


# Load network traffic data
data = pd.read_csv("traffic_data.csv")


# Convert protocol into numbers
data["Protocol"] = data["Protocol"].map({
    "TCP": 1,
    "UDP": 2,
    "ICMP": 3,
    "ARP": 4
})


# Create simple TCP flag features
data["SYN"] = data["TCP Flags"].fillna("").apply(
    lambda x: 1 if "S" in x else 0
)

data["ACK"] = data["TCP Flags"].fillna("").apply(
    lambda x: 1 if "A" in x else 0
)

data["FIN"] = data["TCP Flags"].fillna("").apply(
    lambda x: 1 if "F" in x else 0
)


# Select features for ML
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


# Save ML-ready data
features.to_csv("ml_ready_data.csv", index=False)


print("ML preprocessing complete.")
print("Total packets:", len(features))
print("\nML features:")
print(features.head())