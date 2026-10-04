from django.db import models


class Traffic(models.Model):
    source_ip = models.GenericIPAddressField()
    destination_ip = models.GenericIPAddressField()
    protocol = models.CharField(max_length=20)
    source_port = models.IntegerField(null=True, blank=True)
    destination_port = models.IntegerField(null=True, blank=True)
    packet_size = models.IntegerField(null=True, blank=True)
    tcp_flags = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source_ip} -> {self.destination_ip}"


class Alert(models.Model):
    alert_type = models.CharField(max_length=100)
    source_ip = models.GenericIPAddressField()
    protocol = models.CharField(max_length=20)
    severity = models.CharField(max_length=20)
    detection_method = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alert_type} - {self.severity}"