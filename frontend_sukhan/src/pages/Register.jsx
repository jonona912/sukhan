import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const initialFormState = {
	username: '',
	email: '',
	password: '',
	passwordConfirm: '',
}

export default function Register() {
	const [formData, setFormData] = useState(initialFormState)
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const navigate = useNavigate()

	const handleChange = (event) => {
		const { name, value } = event.target

		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			const result = await response.json()

			if (!response.ok) {
				if (result.errors) {
					setError(result.errors.map((item) => item.msg).join(', '))
				} else {
					setError(result.error || 'Registration failed')
				}
				return
			}

			if (result.token) {
				localStorage.setItem('authToken', result.token)
			}

			setFormData(initialFormState)
			navigate('/', {
				replace: true,
				state: { flashMessage: result.message || 'Account created successfully' },
			})
		} catch {
			setError('Unable to reach the server')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div>
			<h1>Create Account</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Username
					<input
						type='text'
						name='username'
						value={formData.username}
						onChange={handleChange}
						required
					/>
				</label>

				<label>
					Email
					<input
						type='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						required
					/>
				</label>

				<label>
					Password
					<input
						type='password'
						name='password'
						value={formData.password}
						onChange={handleChange}
						required
					/>
				</label>

				<label>
					Confirm Password
					<input
						type='password'
						name='passwordConfirm'
						value={formData.passwordConfirm}
						onChange={handleChange}
						required
					/>
				</label>

				<button type='submit' disabled={isSubmitting}>
					{isSubmitting ? 'Creating account...' : 'Create Account'}
				</button>
			</form>

			{error ? <p>{error}</p> : null}

			<Link to='/'>Back to home</Link>
		</div>
	)
}