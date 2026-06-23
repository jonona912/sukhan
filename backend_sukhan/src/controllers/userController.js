const User = require('../models/User')

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password') // Exclude password
        res.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ error: 'Server error' })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ error: 'Server error' })
    }
}

exports.deleteAllUsers = async (req, res) => {
    try {
        await User.deleteMany({})
        res.json({ message: 'All users deleted successfully' })
    } catch (error) {
        console.error('Error deleting all users:', error)
        res.status(500).json({ error: 'Server error' })
    }
}

