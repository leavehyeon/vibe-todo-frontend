import { useState, useEffect } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [loading, setLoading] = useState(false)

  // 할일 목록 가져오기
  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE_URL)
      if (!response.ok) throw new Error('할일 목록을 가져오는데 실패했습니다.')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
      alert('할일 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 할일 목록 가져오기
  useEffect(() => {
    fetchTodos()
  }, [])

  // 할일 추가
  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) {
      alert('할일 내용을 입력해주세요.')
      return
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputValue.trim() }),
      })

      if (!response.ok) throw new Error('할일 추가에 실패했습니다.')
      
      const newTodo = await response.json()
      setTodos([newTodo, ...todos])
      setInputValue('')
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('할일 추가에 실패했습니다.')
    }
  }

  // 할일 수정 시작
  const handleStartEdit = (todo) => {
    setEditingId(todo._id)
    setEditingContent(todo.content)
  }

  // 할일 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingContent('')
  }

  // 할일 수정 저장
  const handleSaveEdit = async (id) => {
    if (!editingContent.trim()) {
      alert('할일 내용을 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editingContent.trim() }),
      })

      if (!response.ok) throw new Error('할일 수정에 실패했습니다.')
      
      const updatedTodo = await response.json()
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo))
      setEditingId(null)
      setEditingContent('')
    } catch (error) {
      console.error('Error updating todo:', error)
      alert('할일 수정에 실패했습니다.')
    }
  }

  // 할일 삭제
  const handleDeleteTodo = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('할일 삭제에 실패했습니다.')
      
      setTodos(todos.filter(todo => todo._id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('할일 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="app-container">
      <div className="todo-container">
        <h1>할일 목록</h1>
        
        {/* 할일 추가 폼 */}
        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="할일을 입력하세요..."
            className="todo-input"
          />
          <button type="submit" className="add-button">
            추가
          </button>
        </form>

        {/* 할일 목록 */}
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : todos.length === 0 ? (
          <div className="empty-state">할일이 없습니다.</div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className="todo-item">
                {editingId === todo._id ? (
                  // 수정 모드
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="edit-input"
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button
                        onClick={() => handleSaveEdit(todo._id)}
                        className="save-button"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="cancel-button"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 일반 모드
                  <div className="todo-content">
                    <span className="todo-text">{todo.content}</span>
                    <div className="todo-actions">
                      <button
                        onClick={() => handleStartEdit(todo)}
                        className="edit-button"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo._id)}
                        className="delete-button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
