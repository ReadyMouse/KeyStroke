#!/usr/bin/env python3
import csv
import json
import sys

# Increase CSV field size limit
maxInt = sys.maxsize
while True:
    try:
        csv.field_size_limit(maxInt)
        break
    except OverflowError:
        maxInt = int(maxInt/10)
from datetime import datetime, timezone
from pathlib import Path

def count_files_by_scope(csv_path):
    """Count files by scope (public/private) in the CSV."""
    try:
        counts = {'public': 0, 'private': 0}
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f, quoting=csv.QUOTE_ALL)
            for row in reader:
                scope = row.get('scope', '').lower()
                if scope in counts:
                    counts[scope] += 1
        
        counts['total'] = counts['public'] + counts['private']
        return counts
    except FileNotFoundError:
        return {'total': 0, 'public': 0, 'private': 0}

def count_total_storage(csv_path):
    """Count total storage in the CSV."""
    try:
        total_storage = 0
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f, quoting=csv.QUOTE_ALL)
            for row in reader:
                size_str = row.get('size', '0')
                try:
                    # Remove quotes and convert to int
                    size = int(size_str.strip('"'))
                    total_storage += size
                except (ValueError, AttributeError):
                    # Skip non-numeric sizes
                    continue
        return total_storage/1e9 # Convert to GB
    except FileNotFoundError:
        return 0

def count_photos(csv_path):
    """Count numbers of photos in the CSV."""
    try:
        photo_count = 0
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f, quoting=csv.QUOTE_ALL)
            for row in reader:
                if row.get('mimeType', '').startswith('image/'):
                    photo_count += 1
        return photo_count
    except FileNotFoundError:
        return 0

def format_timestamp():
    """Format current time as 'January 30, 2024 at 14:30 UTC'"""
    now = datetime.now(timezone.utc)
    return now.strftime("%B %d, %Y at %H:%M UTC")

def generate_stats():
    """Generate statistics from CSV files."""
    base_dir = Path(__file__).parent.parent
    discovered_csv = base_dir / 'contracts' / 'autodrive-read' / 'autodrive_records.csv'
    
    file_counts = count_files_by_scope(discovered_csv)
    total_storage = count_total_storage(discovered_csv) 
    photos = count_photos(discovered_csv)

    stats = {
        'timestamp': format_timestamp(),
        'files': file_counts,
        'total_storage': total_storage,
        'photos': photos
    }
    
    # Write stats to Jekyll _data directory
    data_dir = base_dir / '_data'
    data_dir.mkdir(exist_ok=True)
    
    with open(data_dir / 'autodrive_stats.json', 'w') as f:
        json.dump(stats, f, indent=2)

if __name__ == '__main__':
    generate_stats()
