

zones = {
    # Format: "ZoneID": [min_latitude, max_latitude, min_longitude, max_longitude]
    "Z01": [-22.15, -22.10, 32.30, 32.35],  # Northwest quadrant
    "Z02": [-22.15, -22.10, 32.15, 32.20],  # Southwest quadrant
    "Z03": [-22.10, -22.05, 32.30, 32.35],  # Central-north
    "Z04": [-22.10, -22.05, 32.15, 32.20],  # Central-south
    "Z05": [-22.05, -22.00, 32.30, 32.35],  # Northeast
    "Z06": [-22.05, -22.00, 32.15, 32.20],   # Southeast
    "Z07": [-21.2, -21.1, 31.6, 31.7],
    "Z08": [-21.1, -21.0, 31.7, 31.8],
    "Z09": [-21.0, -20.9, 31.8, 31.9],
    "Z10": [-20.9, -20.8, 31.9, 32.0]
}

def coordinate_to_zone(lat, lon):
    """
    Maps coordinates to a zone ID (e.g., "Z01").
    Returns None if outside all zones.
    """
    for zone_id, (min_lat, max_lat, min_lon, max_lon) in zones.items():
        if (min_lat <= lat <= max_lat) and (min_lon <= lon <= max_lon):
            return zone_id
    return None