import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPost() {
	const navigate = useNavigate();
	const [content, setContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const token = localStorage.getItem('authToken');
			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token ? `Bearer ${token}` : '',
				},
				body: JSON.stringify({ content }),
			});

			if (!response.ok) {
				throw new Error('Failed to create post');
			}

			navigate('/');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate('/');
	};

	return (
		<div>
			<h1>New Post</h1>
			<form onSubmit={handleSubmit}>
					<label htmlFor="post-content">content</label>
					<textarea
						id="post-content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={6}
						required
					/>

				{error ? <p style={{ color: 'red' }}>{error}</p> : null}

				<div>
					<button type="submit" disabled={loading}>
						{loading ? 'Posting...' : 'Post'}
					</button>
					<button type="button" onClick={handleCancel} disabled={loading}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
