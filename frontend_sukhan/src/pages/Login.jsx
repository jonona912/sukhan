import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const initialFormState = {
	email: '',
	password: '',
}

export default function Login() {
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
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			const result = await response.json()

			if (!response.ok) {
				setError(result.error || 'Login failed')
				return
			}

			if (result.token) {
				localStorage.setItem('authToken', result.token)
				localStorage.setItem('username', result.user.username)
			}

			setFormData(initialFormState)
			navigate('/', {
				replace: true,
				state: { flashMessage: result.message || 'Login successful' },
			})
		} catch {
			setError('Unable to reach the server')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div>
			<h1>Welcome Back</h1>
			<form onSubmit={handleSubmit}>
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

				<button type='submit' disabled={isSubmitting}>
					{isSubmitting ? 'Signing in...' : 'Login'}
				</button>
			</form>

			{error ? <p>{error}</p> : null}

			<p>
				Need an account? <Link to='/register'>Create one</Link>
			</p>
			<Link to='/'>Back to home</Link>
		</div>
	)
}