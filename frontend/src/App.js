import { useState, useEffect } from 'react';
import '@/App.css';
import SchemaBuilder from './components/SchemaBuilder';
import PreviewTable from './components/PreviewTable';
import { Database, Download, Sparkles, Github } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [fields, setFields] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordCount, setRecordCount] = useState(10);
  const [outputFormat, setOutputFormat] = useState('json');
  const [seed, setSeed] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [jsonSchemaText, setJsonSchemaText] = useState('');


  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await fetch(`${API}/fields`);
      const data = await response.json();
      setFields(
        data.fields
          ? data
          : { fields: data }
      );
      
      console.log('Backend fields:', data.fields);

    } catch (error) {
      console.error('Failed to fetch fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (schema.length === 0) {
      alert('Please add at least one field to your schema');
      return;
    }

    setIsGenerating(true);
    try {
      const schemaObj = {};
      schema.forEach(field => {
        if (Object.keys(field.constraints).length > 0) {
          schemaObj[field.name] = {
            type: field.type,
            ...field.constraints
          };
        } else {
          schemaObj[field.name] = field.type;
        }
      });

      const response = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: schemaObj,
          count: Math.min(recordCount, 10),
          format: 'json',
          seed: seed ? parseInt(seed) : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Generation failed');
      }

      const result = await response.json();
      setPreviewData(result.data);
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

 
  //  only those which may be confused by user are kept here 
  const TYPE_ALIASES = {
    // Primitive → backend exact match
    number: 'integer',
    int: 'integer',
    bool: 'boolean',

    // IDs
    id: 'uuid',

    // Dates (people almost always mean "created date")
    date: 'created_at',
    datetime: 'created_at',

    // Identity
    name: 'full_name'
  };



  const applyJsonSchema = (jsonText) => {
    try {
      const raw = String(jsonText).trim();
      const parsed = JSON.parse(raw);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        alert('JSON must be an object like { "field": "type" }');
        return;
      }

      const newSchema = Object.entries(parsed).map(([fieldName, rawType]) => {
        // 1️⃣ backend key takes priority
        let resolvedType = null;

        if (fields?.fields[rawType]) {
          resolvedType = rawType;
        } 
        // 2️⃣ fallback to SAFE aliases only
        else if (TYPE_ALIASES[rawType]) {
          resolvedType = TYPE_ALIASES[rawType];
        }

        if (!resolvedType || !fields.fields[resolvedType]) {
          throw new Error(
            `Unknown field type: "${rawType}". Use a supported backend field type.`
          );
        }

        return {
          name: fieldName,
          type: resolvedType,
          constraints: {}
        };
      });

      setSchema(newSchema);
      setShowJsonInput(false);
    } catch (err) {
      alert(err.message);
    }
  };



  const downloadFullData = async () => {
    if (schema.length === 0) {
      alert('Please add at least one field to your schema');
      return;
    }

    setIsGenerating(true);
    try {
      const schemaObj = {};
      schema.forEach(field => {
        if (Object.keys(field.constraints).length > 0) {
          schemaObj[field.name] = {
            type: field.type,
            ...field.constraints
          };
        } else {
          schemaObj[field.name] = field.type;
        }
      });

      const response = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: schemaObj,
          count: recordCount,
          format: outputFormat,
          seed: seed ? parseInt(seed) : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Generation failed');
      }

      if (outputFormat === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockify-data-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const result = await response.json();
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockify-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-container" data-testid="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Database className="logo-icon" />
            <h1>DummyGen</h1>
          </div>
          <p className="tagline">Production-ready dummy data generator</p>
        </div>
        <a
          href="https://github.com/boharey/dummygen"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
          data-testid="github-link"
        >
          <Github size={20} />
        </a>
      </header>

      <main className="main-content">
        <div className="controls-section">
          <div className="controls-header">
            <h2>Schema Builder</h2>
            <div className="generation-controls">
              <div className="control-group">
                <label>Records</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={recordCount}
                  onChange={(e) => setRecordCount(parseInt(e.target.value) || 10)}
                  data-testid="record-count-input"
                />
              </div>
              <div className="control-group">
                <label>Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  data-testid="format-select"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="control-group">
                <label>Seed (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 42"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  data-testid="seed-input"
                />
              </div>
            </div>
          </div>

          <SchemaBuilder
            fields={fields}
            schema={schema}
            setSchema={setSchema}
          />

          <button
            type="button"
            onClick={() => setShowJsonInput(true)}
            style={{ marginLeft: '8px' }}
          >
            Provide schema via JSON
          </button>

          {showJsonInput && (
            <div className="json-schema-input">
              <h3>Paste Schema JSON</h3>

              <textarea
                rows={10}
                value={jsonSchemaText}
                onChange={(e) => setJsonSchemaText(e.target.value)}
                placeholder={`Example:
          {
            "username": "string",
            "email": "email",
            "phone": "phone"
          }`}
                style={{ width: '100%' }}
              />

              <div style={{ marginTop: '8px' }}>
                <button onClick={() => applyJsonSchema(jsonSchemaText)}>Apply</button>

                <button
                  onClick={() => {
                    setShowJsonInput(false);
                    setJsonSchemaText('');
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="action-buttons">
            <button
              onClick={generatePreview}
              disabled={isGenerating || schema.length === 0}
              className="btn btn-preview"
              data-testid="generate-preview-btn"
            >
              <Sparkles size={16} />
              Generate Preview (max 10)
            </button>
            <button
              onClick={downloadFullData}
              disabled={isGenerating || schema.length === 0}
              className="btn btn-download"
              data-testid="download-full-data-btn"
            >
              <Download size={16} />
              Download Full Data
            </button>
          </div>
        </div>

        {previewData && (
          <div className="preview-section">
            <h2>Preview</h2>
            <PreviewTable data={previewData} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>⚠️ All generated data is dummy/test data only. Not for production use.</p>
        <p>
          <span role="img" aria-label="fingerprint">🖐️</span> 
          Made with 💻 by Boharey
        </p>
      </footer>
    </div>
  );
}

export default App;
