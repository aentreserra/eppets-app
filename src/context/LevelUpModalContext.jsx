import React, {createContext, useState, useContext, useCallback} from 'react';

const LevelUpModalContext = createContext({
  isModalVisible: false,
  levelUpInfo: null,
  showLevelUpModal: () => {},
  hideLevelUpModal: () => {},
});

export const useLevelUpModal = () => {
  return useContext(LevelUpModalContext);
};

export const LevelUpModalProvider = ({children}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  /**
   * Función para mostrar el modal de nivel
   */
  const showLevelUpModal = useCallback((info) => {
    setLevelUpInfo(info);
    setIsModalVisible(true);
  }, []);

  /**
   * Función para ocultar el modal de nivel
   */
  const hideLevelUpModal = useCallback(() => {
    setIsModalVisible(false);
    setLevelUpInfo(null);
  }, []);

  return (
    <LevelUpModalContext.Provider value={{isModalVisible, levelUpInfo, showLevelUpModal, hideLevelUpModal}}>
      {children}
    </LevelUpModalContext.Provider>
  );
}