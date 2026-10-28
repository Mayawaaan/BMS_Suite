// Clean UI Transitions for Executive Dashboard (Lightweight & Native)
export const dashboardAnimations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.25 },
    },
  },
  itemVariants: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  },
  animateHeroEntrance: () => {},
  animateMetricCards: () => {},
};

export default dashboardAnimations;
