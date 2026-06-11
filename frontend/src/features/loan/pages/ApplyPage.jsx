import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../shared/services/api'
import toast from 'react-hot-toast'
import { Send, IndianRupee, User, Briefcase, CreditCard, Home, Brain } from 'lucide-react'
import './ApplyPage.css'

const INITIAL = {
  income: '', coApplicantIncome: '', employmentStatus: '', age: '',
  maritalStatus: '', dependents: '', gender: '', educationLevel: '',
  employerCategory: '', creditScore: '', existingLoans: '', dtiRatio: '',
  savings: '', collateralValue: '', loanAmount: '', loanTerm: '',
  loanPurpose: '', propertyArea: '',
}

function Field({ label, hint, children }) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </label>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="form-section-title">
      <div className="section-icon-wrap"><Icon size={16} /></div>
      <div>
        <span className="section-title-text">{title}</span>
        <span className="section-subtitle">{subtitle}</span>
      </div>
    </div>
  )
}

export default function ApplyPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState(INITIAL)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const num = e => set(e.target.name, e.target.value === '' ? '' : Number(e.target.value))
  const str = e => set(e.target.name, e.target.value)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/loans/apply', {
        ...form,
        income: Number(form.income), coApplicantIncome: Number(form.coApplicantIncome),
        age: Number(form.age), dependents: Number(form.dependents),
        creditScore: Number(form.creditScore), existingLoans: Number(form.existingLoans),
        dtiRatio: Number(form.dtiRatio), savings: Number(form.savings),
        collateralValue: Number(form.collateralValue),
        loanAmount: Number(form.loanAmount), loanTerm: Number(form.loanTerm),
      })
      toast.success('AI analysis complete! View your result.')
      navigate(`/result/${data.data._id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="apply-page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow"><Brain size={13} /> Smart Analysis</div>
          <h1>Apply for a Loan</h1>
          <p className="page-subtitle">Fill in your details below and get an instant credit decision powered by our trained ML model.</p>
        </div>
        <div className="apply-model-info">
          <span className="model-stat">88.4%</span>
          <span className="model-stat-label">Model Accuracy</span>
          <span className="model-stat">1,000</span>
          <span className="model-stat-label">Training Samples</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="apply-form">

        {/* Section 1: Personal */}
        <div className="form-section">
          <SectionHeader icon={User} title="Personal Information" subtitle="Basic applicant details" />
          <div className="form-grid">
            <Field label="Age" hint="Must be 19 or above">
              <input id="age" type="number" name="age" min="19" max="99" value={form.age} onChange={num} required placeholder="28" />
            </Field>
            <Field label="Gender">
              <select id="gender" name="gender" value={form.gender} onChange={str} required>
                <option value="">Select Gender</option>
                <option>Male</option><option>Female</option>
              </select>
            </Field>
            <Field label="Marital Status">
              <select id="maritalStatus" name="maritalStatus" value={form.maritalStatus} onChange={str} required>
                <option value="">Select Status</option>
                <option>Married</option><option>Single</option>
              </select>
            </Field>
            <Field label="Dependents">
              <input id="dependents" type="number" name="dependents" min="0" max="10" value={form.dependents} onChange={num} required placeholder="0" />
            </Field>
            <Field label="Education Level">
              <select id="educationLevel" name="educationLevel" value={form.educationLevel} onChange={str} required>
                <option value="">Select Education</option>
                <option>Graduate</option><option>Not Graduate</option>
              </select>
            </Field>
            <Field label="Property Area">
              <select id="propertyArea" name="propertyArea" value={form.propertyArea} onChange={str} required>
                <option value="">Select Area</option>
                <option>Urban</option><option>Semiurban</option><option>Rural</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Section 2: Employment */}
        <div className="form-section">
          <SectionHeader icon={Briefcase} title="Employment & Income" subtitle="Financial standing details" />
          <div className="form-grid">
            <Field label="Employment Status">
              <select id="employmentStatus" name="employmentStatus" value={form.employmentStatus} onChange={str} required>
                <option value="">Select Status</option>
                <option>Salaried</option><option>Self-employed</option>
                <option>Contract</option><option>Unemployed</option>
              </select>
            </Field>
            <Field label="Employer Category">
              <select id="employerCategory" name="employerCategory" value={form.employerCategory} onChange={str} required>
                <option value="">Select Category</option>
                <option>Private</option><option>Government</option>
                <option>MNC</option><option>Business</option><option>Unemployed</option>
              </select>
            </Field>
            <Field label="Monthly Income (₹)" hint="Applicant's gross monthly income">
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input id="income" type="number" name="income" min="0" value={form.income} onChange={num} required placeholder="50,000" />
              </div>
            </Field>
            <Field label="Co-Applicant Income (₹/mo)">
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input id="coApplicantIncome" type="number" name="coApplicantIncome" min="0" value={form.coApplicantIncome} onChange={num} placeholder="0" />
              </div>
            </Field>
            <Field label="Savings (₹)">
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input id="savings" type="number" name="savings" min="0" value={form.savings} onChange={num} placeholder="1,00,000" />
              </div>
            </Field>
            <Field label="Collateral Value (₹)">
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input id="collateralValue" type="number" name="collateralValue" min="0" value={form.collateralValue} onChange={num} placeholder="0" />
              </div>
            </Field>
          </div>
        </div>

        {/* Section 3: Financial */}
        <div className="form-section">
          <SectionHeader icon={CreditCard} title="Financial Profile" subtitle="Credit history & debt analysis" />
          <div className="form-grid">
            <Field label="Credit Score" hint="Range: 300–900">
              <input id="creditScore" type="number" name="creditScore" min="300" max="900" value={form.creditScore} onChange={num} required placeholder="750" />
            </Field>
            <Field label="Existing Loans">
              <input id="existingLoans" type="number" name="existingLoans" min="0" value={form.existingLoans} onChange={num} placeholder="0" />
            </Field>
            <Field label="Debt-to-Income Ratio" hint="Enter as decimal: 0.30 = 30%">
              <input id="dtiRatio" type="number" name="dtiRatio" min="0" max="1" step="0.01" value={form.dtiRatio} onChange={num} required placeholder="0.30" />
            </Field>
          </div>
        </div>

        {/* Section 4: Loan */}
        <div className="form-section">
          <SectionHeader icon={IndianRupee} title="Loan Details" subtitle="Amount, term and purpose" />
          <div className="form-grid">
            <Field label="Loan Amount (₹)">
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input id="loanAmount" type="number" name="loanAmount" min="1" value={form.loanAmount} onChange={num} required placeholder="5,00,000" />
              </div>
            </Field>
            <Field label="Loan Term (months)" hint="12–360 months">
              <input id="loanTerm" type="number" name="loanTerm" min="1" max="360" value={form.loanTerm} onChange={num} required placeholder="36" />
            </Field>
            <Field label="Loan Purpose">
              <select id="loanPurpose" name="loanPurpose" value={form.loanPurpose} onChange={str} required>
                <option value="">Select Purpose</option>
                <option>Home</option><option>Car</option>
                <option>Education</option><option>Business</option><option>Personal</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="form-footer">
          <button id="apply-submit" type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? <><span className="btn-spinner" /> Analysing with AI...</>
              : <><Send size={15} /> Submit Application</>
            }
          </button>
          <p className="form-note">Powered by Naive Bayes · 88.4% accuracy · Instant decision</p>
        </div>
      </form>
    </div>
  )
}
