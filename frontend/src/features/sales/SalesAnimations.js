// Clean UI Transitions for Sales Module
export const salesAnimations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  },
  cardVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  animateDealWon: () => {},
};

export default salesAnimations;
