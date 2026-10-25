import PropTypes from "prop-types";

export const idType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

export const herbShape = PropTypes.shape({
  id: idType.isRequired,
  name: PropTypes.string,
  scientificName: PropTypes.string,
  latin: PropTypes.string,
  description: PropTypes.string,
  desc: PropTypes.string,
  emoji: PropTypes.string,
  color: PropTypes.string,
  tag: PropTypes.string,
  category: PropTypes.string,
  traditional: PropTypes.string,
  benefits: PropTypes.arrayOf(PropTypes.string),
  evidence: PropTypes.string,
  safety: PropTypes.string,
});
