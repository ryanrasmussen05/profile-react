const SvgComponent = ({ size = 32, rotation = 0 }: { size?: number; rotation?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width={size} height={size} viewBox="0 0 420.008 420.008">
    <path
      transform={`rotate(${rotation} 210 210)`}
      d="m365.192 277.095-99.754-98.273c-5.01-28.326-11.415-59.341-18.311-88.147-5.93-24.787-11.719-45.758-16.735-60.647C222.824 7.577 217.679-.001 210.001 0c-7.676 0-12.82 7.577-20.389 30.029-5.018 14.889-10.807 35.86-16.738 60.647-6.895 28.81-13.295 59.824-18.307 88.15l-99.75 98.269a6.85 6.85 0 0 0-2.045 4.882v37.037a6.854 6.854 0 0 0 8.337 6.692l111.469-24.73c4.313 20.445 9.252 40.032 14.369 58.416l-47.082 44.521a7.4 7.4 0 0 0-1.357 9.014 7.394 7.394 0 0 0 8.42 3.487l52.646-14.643c1.498 4.755 2.982 9.388 4.438 13.88a6.297 6.297 0 0 0 5.99 4.357h.002a6.298 6.298 0 0 0 5.991-4.354 1726.39 1726.39 0 0 0 4.436-13.885l52.65 14.645a7.385 7.385 0 0 0 1.979.271c.061 0 .115 0 .172-.002a7.397 7.397 0 0 0 4.506-13.153l-46.708-44.169c5.709-20.5 10.481-39.83 14.408-58.385l111.46 24.729a6.847 6.847 0 0 0 5.773-1.345 6.856 6.856 0 0 0 2.564-5.347v-37.036a6.84 6.84 0 0 0-2.043-4.882z"
    />
  </svg>
);
export default SvgComponent;
