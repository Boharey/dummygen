import { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';




function SchemaBuilder({ fields, schema, setSchema }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newField, setNewField] = useState({
    name: '',
    type: '',
    constraints: {}
  });
  const fieldMap = fields?.fields ?? fields ?? {};

  const categories = ['All', ...(fields?.categories || [])];


  const getFilteredFields = () => {
    if (!fieldMap) return [];
    if (selectedCategory === 'All') {
      return Object.entries(fieldMap);
    }
    return Object.entries(fieldMap).filter(
      ([_, config]) => config.category === selectedCategory
    );
  };

  const addField = () => {
    if (!newField.name || !newField.type) {
      alert('Please enter field name and select a type');
      return;
    }

    if (schema.find(f => f.name === newField.name)) {
      alert('Field name already exists');
      return;
    }

    setSchema([...schema, { ...newField }]);
    setNewField({ name: '', type: '', constraints: {} });
  };

  const removeField = (index) => {
    setSchema(schema.filter((_, i) => i !== index));
  };

  const updateConstraint = (key, value) => {
    setNewField({
      ...newField,
      constraints: {
        ...newField.constraints,
        [key]: value
      }
    });
  };

  // code to check the version control of the frontend by vercel
  console.log("SCHEMA BUILDER VERSION: NEW");

  const getFieldConfig = (fieldType) => {
    return fieldMap[fieldType] || null;
  };
  const renderConstraintInput = (constraint) => {
    const { name, type, label, required, default: defaultValue } = constraint;

    if (type === 'number') {
      return (
        <div key={name} className="constraint-input">
          <label>{label}</label>
          <input
            type="number"
            placeholder={defaultValue?.toString() || ''}
            value={newField.constraints[name] || ''}
            onChange={(e) => updateConstraint(name, parseInt(e.target.value) || undefined)}
          />
        </div>
      );
    } else {
      return (
        <div key={name} className="constraint-input">
          <label>{label}</label>
          <input
            type="text"
            placeholder={required ? 'Required' : 'Optional'}
            value={newField.constraints[name] || ''}
            onChange={(e) => updateConstraint(name, e.target.value)}
            required={required}
          />
        </div>
      );
    }
  };

  const currentFieldConfig = getFieldConfig(newField.type);

  return (
    <div className="schema-builder" data-testid="schema-builder">
      <div className="field-list">
        {schema.length === 0 ? (
          <div className="empty-state" data-testid="empty-schema-state">
            <p>No fields added yet. Add your first field below.</p>
          </div>
        ) : (
          schema.map((field, index) => (
            <div key={index} className="field-item" data-testid={`schema-field-${index}`}>
              <div className="field-info">
                <span className="field-name">{field.name}</span>
                <span className="field-type">
                  {fieldMap[field.type]?.label || field.type}
                </span>
                {Object.keys(field.constraints).length > 0 && (
                  <span className="field-constraints">
                    {Object.entries(field.constraints)
                      .filter(([_, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeField(index)}
                className="btn-remove"
                data-testid={`remove-field-${index}`}
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="add-field-form">
        <div className="form-row">
          <div className="form-group">
            <label>Field Name</label>
            <input
              type="text"
              placeholder="e.g., user_id"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              data-testid="field-name-input"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="category-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                  data-testid={`category-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Field Type</label>
            <div className="select-wrapper">
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value, constraints: {} })}
                data-testid="field-type-select"
              >
                <option value="">Select a type...</option>
                {getFilteredFields().map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-icon" size={16} />
            </div>
          </div>
        </div>

        {currentFieldConfig && currentFieldConfig.constraints.length > 0 && (
          <div className="constraints-section">
            <label className="constraints-label">Constraints</label>
            <div className="constraints-grid">
              {currentFieldConfig.constraints.map(renderConstraintInput)}
            </div>
          </div>
        )}

        <button
          onClick={addField}
          className="btn btn-add"
          disabled={!newField.name || !newField.type}
          data-testid="add-field-btn"
        >
          <Plus size={16} />
          Add Field
        </button>
      </div>
    </div>
  );
}

export default SchemaBuilder;
