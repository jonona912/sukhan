import { useEffect, useState } from 'react'

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const loadPosts = async () => {
      try {
        const response = await fetch('/api/posts')

        if (!response.ok) {
          throw new Error('Failed to load posts')
        }
        const data = await response.json()
        if (isMounted) {
          setPosts(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      isMounted = false
    }
  }, [])

  const postLike = async (postId) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to like the post')
      }
      const updatedPost = await response.json()
      console.log('Updated post after like:', updatedPost)
      // Optionally, you can update the local state to reflect the like
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likesCount: updatedPost.likesCount } : post
        )
      )
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  if (loading) {
    return <p>Loading posts...</p>
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  if (posts.length === 0) {
    return <p>No posts yet.</p>
  }

  return (
    <section aria-labelledby="posts-heading">
      <h2 id="posts-heading">Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id ?? post._id}>
            <article>
              <header>
                <strong>{post.author?.username ?? 'Unknown author'}</strong>
              </header>
              <p>{post.content}</p>
              <p>likes: {post.likesCount ?? 0}</p>
              <button onClick={() => postLike(post.id ?? post._id)}>Like</button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
