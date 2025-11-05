interface IStepItem {
  colored: boolean;
}

export const StepItem = ({ colored }: IStepItem) => (
  <div style={{ width: '100%', height: 7, backgroundColor: colored ? '#095DD8' : '#C5DCFF', borderRadius: 30 }} />
);
