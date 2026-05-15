import MuseumSectionHeader from '~/components/common/MuseumSectionHeader'

const SectionHeader = ({ eyebrow, title, description }) => (
  <MuseumSectionHeader
    eyebrow={eyebrow}
    title={title}
    description={description}
    align='center'
  />
)

export default SectionHeader
