import React, { useEffect, useRef, useState } from "react";
import { Text } from "react-native";

// Componente Typewriter
type TypewriterProps = {
  text: string;
  typingSpeed?: number; // ms por carácter al escribir
  deletingSpeed?: number; // ms por carácter al borrar
  pauseTime?: number; // ms de pausa al completar o borrar
  style?: object; // aquí aplicas tu fuente y estilos
};

export function Typewriter({
  text,
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseTime = 1000,
  style,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handle = () => {
      const fullText = text;
      const currentIndex = indexRef.current;

      if (!isDeleting) {
        // Escribiendo
        setDisplayed(fullText.substring(0, currentIndex + 1));
        indexRef.current += 1;

        if (indexRef.current === fullText.length) {
          // Al terminar de escribir, pausa y empieza a borrar
          timeout = setTimeout(() => setIsDeleting(true), pauseTime);
          return;
        }
      } else {
        // Borrando
        setDisplayed(fullText.substring(0, currentIndex - 1));
        indexRef.current -= 1;

        if (indexRef.current === 0) {
          // Al terminar de borrar, pausa y vuelve a escribir
          timeout = setTimeout(() => setIsDeleting(false), pauseTime);
          return;
        }
      }

      // Programa siguiente paso
      timeout = setTimeout(handle, isDeleting ? deletingSpeed : typingSpeed);
    };

    timeout = setTimeout(handle, pauseTime);
    return () => clearTimeout(timeout);
  }, [text, typingSpeed, deletingSpeed, pauseTime, isDeleting]);

  return <Text style={style}>{displayed}</Text>;
}
