// Clean UI Transitions for Products Module
export const productsAnimations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  },
  cardVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  pulseCard: () => {},
};

export default productsAnimations;
