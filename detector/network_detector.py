from ml.live_anomaly_detector import detect_anomaly
from logs.alert_logger import save_alert
from detector.traffic_logger import save_traffic
from scapy.all import sniff
from collections import defaultdict
from detector.feature_extractor import extract_features
from datetime import datetime
# Track different types of network activity
port_activity = defaultdict(set)
icmp_activity = defaultdict(int)
syn_activity = defaultdict(int)


# ---------------- PORT SCAN DETECTION ----------------

def check_port_scan(features):

    source_ip = features["source_ip"]
    destination_port = features["destination_port"]

    if source_ip is None or destination_port is None:
        return None

    port_activity[source_ip].add(destination_port)

    if len(port_activity[source_ip]) >= 10:

        return {
            "type": "Possible Port Scan",
            "source_ip": source_ip,
            "severity": "HIGH",
            "detection": "Rule Based"
        }

    return None


# ---------------- ICMP FLOOD DETECTION ----------------

def check_icmp_flood(features):

    source_ip = features["source_ip"]

    if features["protocol"] != "ICMP":
        return None

    if source_ip is None:
        return None

    icmp_activity[source_ip] += 1

    if icmp_activity[source_ip] >= 20:

        return {
            "type": "Possible ICMP Flood",
            "source_ip": source_ip,
            "severity": "HIGH",
            "detection": "Rule Based"
        }

    return None


# ---------------- SYN FLOOD DETECTION ----------------

def check_syn_activity(features):

    source_ip = features["source_ip"]

    if features["protocol"] != "TCP":
        return None

    if source_ip is None:
        return None

    flags = features["tcp_flags"]

    if flags and "S" in flags and "A" not in flags:

        syn_activity[source_ip] += 1

        if syn_activity[source_ip] >= 20:

            return {
                "type": "Possible SYN Flood",
                "source_ip": source_ip,
                "severity": "HIGH",
                "detection": "Rule Based"
            }

    return None


# ---------------- PROCESS PACKET ----------------

def process_packet(packet):

    features = extract_features(packet)

    save_traffic(features)

    alert = None

    # Rule-based detection
    alert = check_port_scan(features)

    if alert is None:
        alert = check_icmp_flood(features)

    if alert is None:
        alert = check_syn_activity(features)

    # ML anomaly detection
    if alert is None:

        ml_result = detect_anomaly(features)

        if ml_result == "Anomaly":

            alert = {
                "type": "ML Detected Anomaly",
                "source_ip": features["source_ip"],
                "severity": "MEDIUM",
                "detection": "Machine Learning",
                "protocol": features["protocol"]
            }

    if alert:

        alert["timestamp"] = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        alert["protocol"] = features["protocol"]

        save_alert(alert)

        return alert

    return None

    # Check port scan
    alert = check_port_scan(features)

    # Check ICMP flood
    if alert is None:
        alert = check_icmp_flood(features)

    # Check SYN activity
    if alert is None:
        alert = check_syn_activity(features)

    # If a threat is detected
    if alert:

        alert["timestamp"] = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        alert["protocol"] = features["protocol"]

        # Save alert to CSV
        save_alert(alert)

        return alert

    return None


# ---------------- MAIN PROGRAM ----------------

print("=" * 60)
print("AI-ASSISTED NETWORK INTRUSION DETECTION SYSTEM")
print("=" * 60)

print("Starting packet monitoring...")
print("Capturing 100 packets...\n")


packets = sniff(count=100)


# Process every captured packet
for packet in packets:

    alert = process_packet(packet)

    if alert:

        print("\n" + "!" * 60)
        print("🚨 SECURITY ALERT")
        print("!" * 60)

        print("Type       :", alert["type"])
        print("Source IP  :", alert["source_ip"])
        print("Protocol   :", alert["protocol"])
        print("Severity   :", alert["severity"])
        print("Detection  :", alert["detection"])
        print("Time       :", alert["timestamp"])

        print("!" * 60)

    else:

        features = extract_features(packet)

        print(
            "Normal:",
            features["source_ip"],
            "->",
            features["destination_ip"],
            "|",
            features["protocol"]
        )


print("\nMonitoring complete.")