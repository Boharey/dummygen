"""Central field registry for extensible dummy data generation.

To add a new field type:
1. Add an entry to FIELD_REGISTRY below
2. That's it! The system automatically handles UI generation and validation.

Example:
    'custom_field': {
        'label': 'Custom Field',
        'faker_method': 'some_faker_method',
        'constraints': [
            {'name': 'param1', 'type': 'text', 'label': 'Parameter 1', 'required': False}
        ]
    }
"""

from typing import Dict, List, Any, Optional
from faker import Faker
import random

# Central extensible field registry
# Adding a new field type only requires adding an entry here
FIELD_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Identity
    'first_name': {
        'label': 'First Name',
        'category': 'Identity',
        'faker_method': 'first_name',
        'constraints': []
    },
    'last_name': {
        'label': 'Last Name',
        'category': 'Identity',
        'faker_method': 'last_name',
        'constraints': []
    },
    'full_name': {
        'label': 'Full Name',
        'category': 'Identity',
        'faker_method': 'name',
        'constraints': []
    },
    'username': {
        'label': 'Username',
        'category': 'Identity',
        'faker_method': 'user_name',
        'constraints': []
    },
    'gender': {
        'label': 'Gender',
        'category': 'Identity',
        'faker_method': 'random_element',
        'faker_args': {'elements': ['Male', 'Female', 'Other']},
        'constraints': []
    },
    
    # Contact
    'email': {
        'label': 'Email',
        'category': 'Contact',
        'faker_method': 'email',
        'constraints': [
            {'name': 'domain', 'type': 'text', 'label': 'Domain (optional)', 'required': False}
        ]
    },
    'safe_email': {
        'label': 'Safe Email',
        'category': 'Contact',
        'faker_method': 'safe_email',
        'constraints': []
    },
    'phone': {
        'label': 'Phone',
        'category': 'Contact',
        'faker_method': 'phone_number',
        'constraints': []
    },
    'phone_us': {
        'label': 'Phone (US)',
        'category': 'Contact',
        'faker_method': 'phone_number',
        'locale': 'en_US',
        'constraints': []
    },
    'phone_in': {
        'label': 'Phone (India)',
        'category': 'Contact',
        'faker_method': 'phone_number',
        'locale': 'en_IN',
        'constraints': []
    },
    
    # Dates & Time
    'dob': {
        'label': 'Date of Birth',
        'category': 'Dates & Time',
        'faker_method': 'date_of_birth',
        'constraints': [
            {'name': 'min_age', 'type': 'number', 'label': 'Min Age', 'required': False, 'default': 18},
            {'name': 'max_age', 'type': 'number', 'label': 'Max Age', 'required': False, 'default': 90}
        ]
    },
    'age': {
        'label': 'Age',
        'category': 'Dates & Time',
        'faker_method': 'random_int',
        'constraints': [
            {'name': 'min', 'type': 'number', 'label': 'Minimum', 'required': False, 'default': 18},
            {'name': 'max', 'type': 'number', 'label': 'Maximum', 'required': False, 'default': 65}
        ]
    },
    'created_at': {
        'label': 'Created At',
        'category': 'Dates & Time',
        'faker_method': 'date_time_this_year',
        'constraints': []
    },
    'updated_at': {
        'label': 'Updated At',
        'category': 'Dates & Time',
        'faker_method': 'date_time_this_month',
        'constraints': []
    },
    
    # IDs & System
    'uuid': {
        'label': 'UUID',
        'category': 'IDs & System',
        'faker_method': 'uuid4',
        'constraints': []
    },
    'integer': {
        'label': 'Integer',
        'category': 'IDs & System',
        'faker_method': 'random_int',
        'constraints': [
            {'name': 'min', 'type': 'number', 'label': 'Minimum', 'required': False, 'default': 1},
            {'name': 'max', 'type': 'number', 'label': 'Maximum', 'required': False, 'default': 1000}
        ]
    },
    'boolean': {
        'label': 'Boolean',
        'category': 'IDs & System',
        'faker_method': 'boolean',
        'constraints': []
    },
    'enum': {
        'label': 'Enum',
        'category': 'IDs & System',
        'faker_method': 'random_element',
        'constraints': [
            {'name': 'values', 'type': 'text', 'label': 'Values (comma-separated)', 'required': True}
        ]
    },
    
    # Text
    'sentence': {
        'label': 'Sentence',
        'category': 'Text',
        'faker_method': 'sentence',
        'constraints': [
            {'name': 'nb_words', 'type': 'number', 'label': 'Number of Words', 'required': False, 'default': 6}
        ]
    },
    'paragraph': {
        'label': 'Paragraph',
        'category': 'Text',
        'faker_method': 'paragraph',
        'constraints': [
            {'name': 'nb_sentences', 'type': 'number', 'label': 'Number of Sentences', 'required': False, 'default': 3}
        ]
    },
    'description': {
        'label': 'Description',
        'category': 'Text',
        'faker_method': 'text',
        'constraints': [
            {'name': 'max_nb_chars', 'type': 'number', 'label': 'Max Characters', 'required': False, 'default': 200}
        ]
    },
}

def get_field_metadata() -> Dict[str, Any]:
    """Return field metadata for frontend consumption."""
    return {
        'fields': FIELD_REGISTRY,
        'categories': list(set(field['category'] for field in FIELD_REGISTRY.values()))
    }

def generate_field_value(fake: Faker, field_type: str, constraints: Optional[Dict[str, Any]] = None) -> Any:
    """Generate a single field value based on type and constraints.
    
    Args:
        fake: Faker instance
        field_type: Type of field to generate
        constraints: Optional constraints dictionary
    
    Returns:
        Generated value
    """
    if field_type not in FIELD_REGISTRY:
        raise ValueError(f"Unknown field type: {field_type}")
    
    field_config = FIELD_REGISTRY[field_type]
    faker_method = field_config['faker_method']
    faker_args = field_config.get('faker_args', {})
    
    # Handle locale-specific generation
    if 'locale' in field_config:
        fake = Faker(field_config['locale'])
    
    # Get the faker method
    method = getattr(fake, faker_method)
    
    # Prepare arguments based on constraints
    args = {}
    if constraints:
        # Handle special cases
        if field_type == 'email' and 'domain' in constraints and constraints['domain']:
            return fake.user_name() + '@' + constraints['domain']
        elif field_type == 'enum' and 'values' in constraints:
            values = [v.strip() for v in constraints['values'].split(',')]
            return random.choice(values)
        elif field_type == 'dob':
            min_age = constraints.get('min_age', 18)
            max_age = constraints.get('max_age', 90)
            return method(minimum_age=min_age, maximum_age=max_age)
        else:
            # Pass constraints as method arguments
            args = {k: v for k, v in constraints.items() if v is not None}
    
    # Merge with default faker_args
    args = {**faker_args, **args}
    
    try:
        result = method(**args) if args else method()
        # Convert datetime objects to ISO string
        if hasattr(result, 'isoformat'):
            return result.isoformat()
        return result
    except Exception as e:
        # Fallback to method without args if there's an issue
        result = method()
        if hasattr(result, 'isoformat'):
            return result.isoformat()
        return result
