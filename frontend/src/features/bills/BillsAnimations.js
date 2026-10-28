// Clean UI Transitions for Bills Module
export const billsAnimations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  },
  rowVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  flashRow: () => {},
};

export default billsAnimations;
