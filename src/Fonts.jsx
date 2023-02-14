import styled from "styled-components"

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: black;
  color: white;
  font-family: SearchMono;

  h1 {
    font-weight: bold;
  }
`

const Fonts = () => {
  return (
    <Container>
      <h1>PERSONAL BRANDING</h1>
      <h2>PERSONAL BRANDING</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut</p>
      <p style={{ display: "block", width: "200px" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut
      </p>
      <p style={{ textTransform: "uppercase" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut
      </p>
    </Container>
  )
}
export default Fonts
