import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Posts from '../components/Posts.jsx'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const [flashMessage, setFlashMessage] = useState('')
  const [isLoggedIn] = useState(() => Boolean(localStorage.getItem('authToken')))
  const username = useState(() => localStorage.getItem('username'))[0]

  useEffect(() => {
    console.log('Setting document title')
    document.title = 'Welcome'
  }, [])

  // [location.state] is called a dependency array, it tells React to run this effect whenever location.state changes
  useEffect(() => {
    const message = location.state?.flashMessage
    if (!message) {
      return
    }
    setFlashMessage(message)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  return (
    <div>
      {flashMessage ? <p>{flashMessage}</p> : null}
      <div>
        {isLoggedIn ? (
          <Link to="/new-post">
            <button type="button">New Post</button>
          </Link>
        ) : (
          <>
            <Link to="/login">
              <button type='button'>Login</button>
            </Link>
            <Link to="/register">
              <button type="button" name="create-account">Create Account</button>
            </Link>
          </>
        )}
      </div>

      <div>
        <h1>{username ? `${username}, ` : ''}Welcome to home page</h1>
      </div>

      <Posts />
    </div>
  )
}
