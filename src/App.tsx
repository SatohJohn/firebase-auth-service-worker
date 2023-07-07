import {Login, Logout} from './Login.tsx'
import React from 'react'
import {useState} from "react"
function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const setLoginState = (state: boolean) => {
    setLoggedIn(state)
  }
  let body
  if (loggedIn === false) {
    body = <Login onLoggedIn={setLoginState}></Login>
  } else {
    body = <div>
      <Logout onLoggedIn={setLoginState}></Logout>
      <Main></Main>
    </div>
  }
  return (
    <>
      <h1>Vite + React</h1>
      {body}
    </>
  )
}

function Main() {
  const call = () => {
    fetch("/api/profile").then((res) => {
      console.log(res)
    })
  }
  return (
    <>
    <div>
      <button onClick={call}>apiを叩く</button>
    </div>
    </>
  )
}

export default App