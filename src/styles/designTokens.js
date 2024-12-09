// Colors
export const colors = {
  primary: {
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
    yellow: 'bg-yellow-500'
  },
  text: {
    primary: 'text-gray-700',
    secondary: 'text-gray-600',
    white: 'text-white',
    error: 'text-red-700',
    success: 'text-green-600',
    accent: 'text-blue-600'
  },
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    header: 'bg-gray-800',
    error: 'bg-red-100'
  },
  border: {
    error: 'border-red-400',
    table: 'border-b',
    spinner: 'border-t-4 border-b-4 border-blue-500'
  }
};

// Typography
export const typography = {
  size: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  },
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }
};

// Spacing
export const spacing = {
  padding: {
    cell: 'px-2 py-1.5',
    container: 'px-2 py-4',
    error: 'px-3 py-2'
  },
  margin: {
    standard: 'mb-4',
    tight: 'mb-2',
    tighter: 'mb-3'
  },
  gap: {
    small: 'gap-0.5',
    medium: 'gap-1',
    large: 'gap-2'
  }
};

// Layout
export const layout = {
  container: {
    default: 'container mx-auto'
  },
  flex: {
    center: 'flex items-center justify-center',
    col: 'flex flex-col',
    row: 'flex items-center'
  },
  width: {
    icon: 'w-4',
    avatar: 'w-5',
    circle: 'w-5',
    full: 'w-full',
    min: 'min-w-full'
  },
  height: {
    icon: 'h-4',
    avatar: 'h-5',
    circle: 'h-5'
  }
};

// Components
export const components = {
  table: {
    container: 'overflow-x-auto',
    base: 'min-w-full bg-white shadow-sm rounded-lg text-sm',
    row: {
      hover: 'hover:bg-gray-50 border-b'
    },
    cell: {
      base: 'px-2 py-1.5',
      header: 'px-2 py-2'
    }
  },
  formCircle: {
    base: 'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
    indicator: 'w-5 h-1 rounded-full mt-2 absolute bottom-[-5px]'
  },
  spinner: {
    container: 'animate-spin rounded-full h-12 w-12'
  }
};

// Animation
export const animation = {
  spin: 'animate-spin'
}; 