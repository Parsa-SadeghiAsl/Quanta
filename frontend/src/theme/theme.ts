import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';


export const AppColors = {
  primary: '#112D4E',   
  secondary: '#e8f6ffff',   
  accent: '#ff5252ff',    
  background: '#ffffffff',   
  surface: '#ffffffff',     
  text: '#1b1b1bff', 
  placeholder: '#95a5a6',  
  error: '#e74c3c',        
  success: '#2ecc71',    
};

export const PaperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppColors.primary,
    primaryContainer: AppColors.secondary,
    secondaryContainer: AppColors.secondary,
    background: AppColors.background,
    elevation: {
      level0 : "transparent",
      level1 : AppColors.background,
      level2 : AppColors.background,
      level3 : AppColors.background,
      level4 : AppColors.background,
      level5 : AppColors.background,
    },
    surface: AppColors.surface,
    text: AppColors.text,
    placeholder: AppColors.placeholder,
    error: AppColors.error,
  },
};

export const NavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: AppColors.primary,       
    background: AppColors.background, 
    card: AppColors.surface,          
    text: AppColors.text,           
    border: '#DDE2E5',              
  },
};


