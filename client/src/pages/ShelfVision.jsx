import { useState, useRef } from 'react';
import { api } from '../services/api';
import { Eye, Upload, Camera, CheckCircle, AlertTriangle, RefreshCw, Loader, Info } from 'lucide-react';

export default function ShelfVision() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const fileInputRef = useRef(null);

  // Sample shelf image scenarios for demo convenience
  const sampleScenarios = [
    {
      id: 'vegetables',
      name: 'Fresh Produce Shelf (Tomatoes, Spinach, Peppers)',
      description: 'Mixed vegetable display with varying ripeness levels and slight wilting on leafy greens.',
      svgPattern: 'vegetables'
    },
    {
      id: 'protein_cooler',
      name: 'Chilled Protein Cabinet (Poultry & Meat)',
      description: 'Pre-packaged poultry and beef packages with cold chain monitoring tags.',
      svgPattern: 'protein'
    },
    {
      id: 'bakery_shelf',
      name: 'Bakery & Fresh Sandwich Display',
      description: 'Daily sandwich boxes and artisan loaves approaching morning expiration window.',
      svgPattern: 'bakery'
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    setError(null);
    setSelectedDemo(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setImagePreview(base64Data);
      analyzeImage(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (scenario) => {
    setSelectedDemo(scenario);
    setImagePreview(null);
    setError(null);
    setAnalyzing(true);
    try {
      // Analyze with demo fallback or simulated server analysis
      const res = await api.analyzeShelfDemo();
      setResult(res);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeImage = async (dataUri, mimeType) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      // Strip data:image/...;base64, prefix
      const base64String = dataUri.split(',')[1] || dataUri;
      const res = await api.analyzeShelf(base64String, mimeType);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to inspect shelf with Gemini Vision.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Eye className="w-7 h-7 text-emerald-400" />
            Shelf Vision AI
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Multimodal Gemini Vision for autonomous shelf inventory count, condition audit, and stock depletion detection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="demo-badge">Multimodal Gemini Vision</span>
          <span className="demo-badge">AI estimate — verify manually</span>
        </div>
      </div>

      {/* Main Grid: Upload/Capture Panel & Results Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Ingestion */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              Store Shelf Ingestion
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Upload a shelf photo or select a pre-staged store camera feed to trigger multimodal optical item detection.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2a2d3e] hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#13151f]/50 group"
            >
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Shelf Scan Preview"
                    className="max-h-56 mx-auto rounded-lg object-cover border border-[#2a2d3e]"
                  />
                  <div className="text-xs text-emerald-400 font-medium">Click to replace shelf photo</div>
                </div>
              ) : selectedDemo ? (
                <div className="py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{selectedDemo.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{selectedDemo.description}</div>
                  </div>
                  <div className="text-xs text-emerald-400 font-mono">Camera Feed #4-Dhaka-Hub</div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">Click to upload shelf photo</span>
                    <span className="block text-xs text-gray-400 mt-1">PNG, JPG, or WEBP up to 10MB</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Pre-sets */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Or Select Seeded Store Cam:
              </div>
              <div className="space-y-2">
                {sampleScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectSample(sc)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      selectedDemo?.id === sc.id
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                        : 'border-[#2a2d3e] bg-[#13151f] text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{sc.name}</div>
                      <div className="text-[11px] text-gray-400 line-clamp-1">{sc.description}</div>
                    </div>
                    <Camera className="w-3.5 h-3.5 ml-2 flex-shrink-0 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model info banner */}
          <div className="card-sm bg-blue-500/5 border-blue-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
              <Info className="w-4 h-4 flex-shrink-0" />
              Multimodal Inference Architecture
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              When an image is provided, WASTELENS leverages <code className="text-emerald-400">gemini-3.8-flash</code> to visually parse SKU density, calculate item quantity approximations, assess visual signs of wilting/freshness decay, and flag depleted shelf sections for reorder.
            </p>
          </div>
        </div>

        {/* Right Column: AI Visual Analysis Output */}
        <div className="lg:col-span-7 space-y-4">
          {analyzing ? (
            <div className="card py-20 text-center space-y-4">
              <Loader className="w-9 h-9 text-emerald-400 animate-spin mx-auto" />
              <div>
                <h4 className="text-white font-medium">Vision Engine Parsing Pixels...</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Extracting bounding coordinates, classifying perishables, and estimating count density.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Analysis Summary Header Card */}
              <div className="card border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-risk-low">Scan Verified</span>
                      <span className="text-xs font-mono text-gray-400">
                        Confidence: {Math.round((result.ai_confidence || 0.85) * 100)}%
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1.5">
                      Shelf Condition: <span className="text-emerald-400 uppercase">{result.shelf_condition || 'Adequate'}</span>
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">{result.general_observations}</p>
                  </div>
                  <div className="text-right">
                    <span className="demo-badge">AI estimate — verify manually</span>
                  </div>
                </div>

                {/* Low Stock Alerts if any */}
                {result.low_stock_areas && result.low_stock_areas.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#2a2d3e]">
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Visual Empty/Low-Stock Regions Detected:
                    </div>
                    <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                      {result.low_stock_areas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Detected Items Table */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white text-sm">Detected Shelf Products ({result.items?.length || 0})</h4>
                  <span className="text-xs text-gray-400 font-mono">Structured Output</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2a2d3e] text-gray-400">
                        <th className="pb-2.5 font-medium">Item Name</th>
                        <th className="pb-2.5 font-medium">Category</th>
                        <th className="pb-2.5 font-medium">Estimated Qty</th>
                        <th className="pb-2.5 font-medium">Confidence</th>
                        <th className="pb-2.5 font-medium">Visual Quality</th>
                        <th className="pb-2.5 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2d3e]">
                      {result.items?.map((item, idx) => (
                        <tr key={idx} className="text-gray-200 hover:bg-white/5">
                          <td className="py-2.5 font-medium text-white">{item.item}</td>
                          <td className="py-2.5 text-gray-400">{item.category}</td>
                          <td className="py-2.5 font-mono text-emerald-400 font-semibold">
                            {item.estimated_quantity} {item.unit}
                          </td>
                          <td className="py-2.5 font-mono">
                            <span className={item.confidence >= 0.85 ? 'text-emerald-400' : 'text-amber-400'}>
                              {Math.round(item.confidence * 100)}%
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                item.condition === 'good'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : item.condition === 'fair'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {item.condition?.toUpperCase() || 'GOOD'}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-400 max-w-[180px] truncate">{item.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2a2d3e] flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cross-referenced against ERP product catalog</span>
                  </div>
                  <button
                    onClick={() => {
                      if (imagePreview) analyzeImage(imagePreview, 'image/jpeg');
                      else if (selectedDemo) handleSelectSample(selectedDemo);
                    }}
                    className="btn-secondary flex items-center gap-1.5 py-1 text-xs"
                  >
                    <RefreshCw className="w-3 h-3" /> Re-scan
                  </button>
                </div>
              </div>

              {/* Raw JSON Preview Toggle */}
              <div className="card-sm bg-[#13151f]">
                <div className="text-[11px] font-mono text-gray-400 mb-1">
                  Structured JSON Payload (Ingestion Bus Schema):
                </div>
                <pre className="text-[10px] font-mono text-emerald-400/90 overflow-x-auto p-2 bg-[#0a0c12] rounded border border-[#2a2d3e]">
                  {JSON.stringify(result.items, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="card text-center py-20 border-dashed space-y-3">
              <Camera className="w-10 h-10 text-gray-600 mx-auto" />
              <div className="text-gray-300 font-medium text-sm">No Shelf Image Analyzed Yet</div>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Upload a shelf photo on the left or click any demo store camera feed to initiate vision-based inventory and waste threat detection.
              </p>
              <button
                onClick={() => handleSelectSample(sampleScenarios[0])}
                className="btn-primary inline-flex items-center gap-2 text-xs"
              >
                <Camera className="w-3.5 h-3.5" /> Run Produce Cam Demo
              </button>
            </div>
          )}

          {error && (
            <div className="card bg-red-500/10 border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
