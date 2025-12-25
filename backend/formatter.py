"""Output formatting utilities."""

import json
import csv
from io import StringIO
from typing import List, Dict, Any

def format_as_json(data: List[Dict[str, Any]]) -> str:
    """Format data as JSON string.
    
    Args:
        data: List of records
    
    Returns:
        JSON string
    """
    return json.dumps(data, indent=2, default=str)

def format_as_csv(data: List[Dict[str, Any]]) -> str:
    """Format data as CSV string.
    
    Args:
        data: List of records
    
    Returns:
        CSV string
    """
    if not data:
        return ""
    
    output = StringIO()
    fieldnames = list(data[0].keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    
    writer.writeheader()
    writer.writerows(data)
    
    return output.getvalue()
