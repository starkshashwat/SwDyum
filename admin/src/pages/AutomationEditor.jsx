import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Clock, Mail, MessageSquare, GitMerge, Tag, Ticket, Ban } from 'lucide-react';

const TRIGGER_EVENTS = ['customer_registered', 'order_placed', 'order_shipped', 'order_delivered', 'cart_abandoned', 'payment_failed', 'order_cancelled', 'out_for_delivery', 'refund_initiated', 'refund_completed'];

export default function AutomationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [waTemplates, setWaTemplates] = useState([]);

  const [automation, setAutomation] = useState({
    name: '',
    trigger_event: 'order_placed',
    status: 'Draft',
    steps: []
  });

  useEffect(() => {
    fetchTemplates();
    if (!isNew) {
      fetchAutomation();
    }
  }, [id]);

  const fetchTemplates = async () => {
    try {
      const [emailRes, waRes] = await Promise.all([
        axios.get('/api/automations/config/templates?channel=email', { withCredentials: true }),
        axios.get('/api/automations/config/templates?channel=whatsapp', { withCredentials: true })
      ]);
      setEmailTemplates(emailRes.data?.data || []);
      setWaTemplates(waRes.data?.data || []);
    } catch (error) {
      console.error('Failed to load templates');
    }
  };

  const fetchAutomation = async () => {
    try {
      const res = await axios.get(`/api/automations/${id}`, { withCredentials: true });
      const data = res.data?.data;
      if (data) {
        setAutomation({
          name: data.name || '',
          trigger_event: data.trigger_event || 'order_placed',
          status: data.status || 'Draft',
          steps: data.automation_steps || []
        });
      }
    } catch (error) {
      toast.error('Failed to load automation');
      navigate('/automations');
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = (type) => {
    const newStep = {
      step_type: type,
      config: type === 'Wait' ? { value: '1', unit: 'days' } : 
              type === 'Condition' ? { condition_type: 'order_completed', expected_value: 'No', operator: '=', no_branch_step_order: null } :
              type === 'Add Customer Tag' ? { tag_name: '' } :
              type === 'Generate Coupon' ? { discount_type: 'percentage', discount_value: '10', expiry_days: '7' } :
              type === 'End Automation' ? {} :
              { template_id: '' }
    };
    setAutomation(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const removeStep = (index) => {
    setAutomation(prev => {
      const newSteps = [...prev.steps];
      newSteps.splice(index, 1);
      return { ...prev, steps: newSteps };
    });
  };

  const updateStepConfig = (index, key, value) => {
    setAutomation(prev => {
      const newSteps = [...prev.steps];
      newSteps[index] = {
        ...newSteps[index],
        config: { ...newSteps[index].config, [key]: value }
      };
      return { ...prev, steps: newSteps };
    });
  };

  const handleSave = async () => {
    if (!automation.name.trim()) return toast.error('Name is required');
    
    setIsSaving(true);
    try {
      if (isNew) {
        await axios.post('/api/automations', automation, { withCredentials: true });
        toast.success('Automation created');
        navigate('/automations');
      } else {
        await axios.put(`/api/automations/${id}`, automation, { withCredentials: true });
        toast.success('Automation updated (Version bumped)');
        fetchAutomation();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading editor...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/automations')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={automation.name}
            onChange={e => setAutomation(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Automation Name"
            className="text-lg font-bold text-gray-900 border-none focus:ring-0 p-0 bg-transparent"
          />
          <select
            value={automation.status}
            onChange={e => setAutomation(prev => ({ ...prev, status: e.target.value }))}
            className="text-sm border-gray-300 rounded-md py-1 pl-3 pr-8 focus:ring-black focus:border-black"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium text-sm"
        >
          {isSaving ? 'Saving...' : 'Save Workflow'}
        </button>
      </header>

      {/* Canvas Area */}
      <main className="flex-1 overflow-y-auto p-8 relative flex flex-col items-center">
        
        {/* Trigger Block */}
        <div className="w-full max-w-md bg-white border border-gray-300 shadow-sm rounded-lg p-5 flex flex-col items-center text-center z-10 relative">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-black mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">When this happens...</h3>
          <select
            value={automation.trigger_event}
            onChange={e => setAutomation(prev => ({ ...prev, trigger_event: e.target.value }))}
            className="mt-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm text-center"
            disabled={!isNew}
          >
            {TRIGGER_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
          {!isNew && <p className="text-xs text-gray-400 mt-2">Trigger cannot be changed after creation.</p>}
        </div>

        {/* Steps */}
        {automation.steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center w-full max-w-md">
            {/* Connector Line */}
            <div className="w-0.5 h-8 bg-gray-300"></div>
            
            {/* Step Block */}
            <div className="w-full bg-white border border-gray-200 shadow-sm rounded-lg p-5 relative group">
              <button
                onClick={() => removeStep(index)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.step_type === 'Wait' ? 'bg-orange-100 text-orange-600' :
                  step.step_type === 'Condition' ? 'bg-purple-100 text-purple-600' :
                  step.step_type === 'Send WhatsApp' ? 'bg-green-100 text-green-600' :
                  step.step_type === 'Add Customer Tag' ? 'bg-blue-100 text-blue-600' :
                  step.step_type === 'Generate Coupon' ? 'bg-yellow-100 text-yellow-600' :
                  step.step_type === 'Send Coupon' ? 'bg-indigo-100 text-indigo-600' :
                  step.step_type === 'End Automation' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {step.step_type === 'Wait' && <Clock className="w-4 h-4" />}
                  {step.step_type === 'Condition' && <GitMerge className="w-4 h-4" />}
                  {step.step_type === 'Send WhatsApp' && <MessageSquare className="w-4 h-4" />}
                  {step.step_type === 'Send Email' && <Mail className="w-4 h-4" />}
                  {step.step_type === 'Add Customer Tag' && <Tag className="w-4 h-4" />}
                  {(step.step_type === 'Generate Coupon' || step.step_type === 'Send Coupon') && <Ticket className="w-4 h-4" />}
                  {step.step_type === 'End Automation' && <Ban className="w-4 h-4" />}
                </div>
                <h3 className="font-semibold text-gray-900">{step.step_type}</h3>
                <span className="ml-auto text-xs font-mono text-gray-400">Step {index + 1}</span>
              </div>

              {/* Step Config */}
              {step.step_type === 'Wait' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={step.config.value}
                    onChange={e => updateStepConfig(index, 'value', e.target.value)}
                    className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  />
                  <select
                    value={step.config.unit}
                    onChange={e => updateStepConfig(index, 'unit', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              )}

              {(step.step_type === 'Send Email' || step.step_type === 'Send WhatsApp') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Select Template</label>
                  <select
                    value={step.config.template_id}
                    onChange={e => updateStepConfig(index, 'template_id', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  >
                    <option value="">-- Choose Template --</option>
                    {(step.step_type === 'Send Email' ? emailTemplates : waTemplates).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {step.step_type === 'Condition' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Condition Type</label>
                    <select
                      value={step.config.condition_type}
                      onChange={e => updateStepConfig(index, 'condition_type', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm mb-2"
                    >
                      <option value="order_completed">Order Completed (Avoid Abandoned Cart)</option>
                      <option value="customer_type">Customer Type</option>
                      <option value="order_value">Order Value</option>
                      <option value="product">Order contains Product</option>
                      <option value="category">Order contains Category</option>
                      <option value="payment_method">Payment Method</option>
                    </select>

                    {step.config.condition_type === 'order_value' && (
                      <div className="flex gap-2 mt-2">
                        <select
                          value={step.config.operator || '='}
                          onChange={e => updateStepConfig(index, 'operator', e.target.value)}
                          className="block w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                        >
                          <option value=">">&gt;</option>
                          <option value="<">&lt;</option>
                          <option value="=">=</option>
                          <option value=">=">&gt;=</option>
                          <option value="<=">&lt;=</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={step.config.expected_value || ''}
                          onChange={e => updateStepConfig(index, 'expected_value', e.target.value)}
                          className="block w-2/3 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                        />
                      </div>
                    )}
                    
                    {step.config.condition_type === 'customer_type' && (
                      <select
                        value={step.config.expected_value || 'New'}
                        onChange={e => updateStepConfig(index, 'expected_value', e.target.value)}
                        className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                      >
                        <option value="New">First-time Customer</option>
                        <option value="Returning">Returning Customer</option>
                      </select>
                    )}

                    {step.config.condition_type === 'payment_method' && (
                      <select
                        value={step.config.expected_value || 'COD'}
                        onChange={e => updateStepConfig(index, 'expected_value', e.target.value)}
                        className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                      >
                        <option value="COD">COD</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    )}

                    {(step.config.condition_type === 'product' || step.config.condition_type === 'category' || step.config.condition_type === 'order_completed') && (
                       <input
                         type="text"
                         placeholder={step.config.condition_type === 'order_completed' ? "Yes / No" : "Enter Name/ID"}
                         value={step.config.expected_value || ''}
                         onChange={e => updateStepConfig(index, 'expected_value', e.target.value)}
                         className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                       />
                    )}
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Stop workflow if condition is NOT met</label>
                     <p className="text-xs text-gray-400">If condition is met, workflow continues to step {index + 2}. (V1 only supports single path execution).</p>
                  </div>
                </div>
              )}

              {step.step_type === 'Add Customer Tag' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tag Name</label>
                  <input
                    type="text"
                    placeholder="e.g. abandoned-cart"
                    value={step.config.tag_name || ''}
                    onChange={e => updateStepConfig(index, 'tag_name', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              )}

              {step.step_type === 'Generate Coupon' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={step.config.discount_type || 'percentage'}
                        onChange={e => updateStepConfig(index, 'discount_type', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs text-gray-500 mb-1">Value</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={step.config.discount_value || ''}
                        onChange={e => updateStepConfig(index, 'discount_value', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Expiry (Days)</label>
                    <input
                      type="number"
                      placeholder="7"
                      value={step.config.expiry_days || ''}
                      onChange={e => updateStepConfig(index, 'expiry_days', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {step.step_type === 'Send Coupon' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Select Email Template</label>
                    <select
                      value={step.config.template_id || ''}
                      onChange={e => updateStepConfig(index, 'template_id', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                    >
                      <option value="">-- Choose Template --</option>
                      {emailTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={step.config.coupon_type || 'percentage'}
                        onChange={e => updateStepConfig(index, 'coupon_type', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs text-gray-500 mb-1">Value</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={step.config.discount_value || ''}
                        onChange={e => updateStepConfig(index, 'discount_value', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}

        {/* Add Step Connector */}
        <div className="w-0.5 h-8 bg-gray-300"></div>

        {/* Add Step Button */}
        <div className="w-full max-w-md bg-white border border-dashed border-gray-300 rounded-lg p-4 hover:border-black hover:bg-gray-50 transition-colors">
          <div className="flex justify-center gap-2 flex-wrap">
            <button onClick={() => addStep('Wait')} className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Wait
            </button>
            <button onClick={() => addStep('Send Email')} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button onClick={() => addStep('Send WhatsApp')} className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button onClick={() => addStep('Condition')} className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex items-center gap-1">
              <GitMerge className="w-3.5 h-3.5" /> Condition
            </button>
            <button onClick={() => addStep('Add Customer Tag')} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tag
            </button>
            <button onClick={() => addStep('Generate Coupon')} className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5" /> Gen Coupon
            </button>
            <button onClick={() => addStep('Send Coupon')} className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5" /> Send Coupon
            </button>
            <button onClick={() => addStep('End Automation')} className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" /> End
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
