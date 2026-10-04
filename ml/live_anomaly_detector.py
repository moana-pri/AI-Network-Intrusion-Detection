import pandas as pd
from sklearn.ensemble import IsolationForest


# Load previously collected traffic
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


# Create and train the model
model = IsolationForest(
    contamination=0.05,
    random_state=42
)

model.fit(features)


def detect_anomaly(packet_features):

    protocol = packet_features["protocol"]

    if protocol == "TCP":
        protocol = 1
    elif protocol == "UDP":
        protocol = 2
    elif protocol == "ICMP":
        protocol = 3
    elif protocol == "ARP":
        protocol = 4
    else:
        protocol = 0

    flags = packet_features["tcp_flags"]

    if flags is None:
        flags = ""

    syn = 1 if "S" in flags else 0
    ack = 1 if "A" in flags else 0
    fin = 1 if "F" in flags else 0

    packet = [[
        protocol,
        packet_features["source_port"] or 0,
        packet_features["destination_port"] or 0,
        packet_features["packet_size"],
        syn,
        ack,
        fin
    ]]

    prediction = model.predict(packet)

    if prediction[0] == -1:
        return "Anomaly"

    return "Normal"