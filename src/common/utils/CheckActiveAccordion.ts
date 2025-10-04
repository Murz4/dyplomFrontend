const CheckActiveAccordion = (prevIndexes: number[], index: number) =>
  prevIndexes.includes(index) ? prevIndexes.filter(i => i !== index) : [...prevIndexes, index];

export default CheckActiveAccordion;
