"""Core data generation logic."""

from typing import Dict, List, Any, Optional
from faker import Faker
from fields import generate_field_value

def generate_data(
    schema: Dict[str, Any],
    count: int,
    seed: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Generate dummy data based on schema.
    
    Args:
        schema: Field definitions (field_name -> field_type or {type, constraints})
        count: Number of records to generate
        seed: Optional seed for deterministic output
    
    Returns:
        List of generated records
    """
    # Initialize Faker with seed if provided
    if seed is not None:
        Faker.seed(seed)
    
    fake = Faker()
    records = []
    
    for _ in range(count):
        record = {}
        for field_name, field_def in schema.items():
            # Handle both simple string type and object with constraints
            if isinstance(field_def, str):
                field_type = field_def
                constraints = None
            else:
                field_type = field_def.get('type')
                constraints = {k: v for k, v in field_def.items() if k != 'type'}
            
            # Generate field value (will raise ValueError for invalid field types)
            record[field_name] = generate_field_value(fake, field_type, constraints)
        
        records.append(record)
    
    return records
