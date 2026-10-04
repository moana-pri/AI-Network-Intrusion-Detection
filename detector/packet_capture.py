from scapy.all import sniff

print("Starting packet capture...")
print("Capturing 10 packets...\n")

packets = sniff(count=10)

print("\nCapture complete.")

for packet in packets:
    print(packet.summary())