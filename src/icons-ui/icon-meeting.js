import Icon from '@ant-design/icons'

const meetingSvg = () => (
  <svg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg' width='1em' height='1em'><path d='M21 6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h18zm-1 2H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1zm10 1.618a1 1 0 0 1 .993.883l.007.117v10.764a1 1 0 0 1-1.34.94l-.107-.046-5-2.5a1 1 0 0 1-.545-.77L24 18.881v-5.764a1 1 0 0 1 .445-.832l.108-.063 5-2.5c.139-.069.292-.106.447-.106zm-1 2.618-3 1.5v4.528l3 1.5v-7.528z' /></svg>
)

export const MeetingIcon = props => <Icon component={meetingSvg} {...props} />
