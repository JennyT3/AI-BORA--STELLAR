import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const COMMAND = "bora digitalizar padaria-santos";
const OUTPUT_LINES = [
  "",
  "┌  AI BORA Digital",
  "│",
  "◇  A analisar o negócio...",
  "│",
  "◇  Google Business configurado ✓",
  "│",
  "◇  Site profissional criado ✓",
  "│",
  "◇  WhatsApp Business ativo ✓",
  "│",
  "◇  Email profissional: santos@padaria.pt ✓",
  "│",
  "●  Pack Completo — €350 + IVA",
  "│",
  "│  Entrega em 3 semanas. Sem mensalidades.",
  "│",
  "└  O seu negócio está online! 🚀",
];

export function AnimatedTerminal() {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const typeChar = (index: number) => {
      if (index <= COMMAND.length) {
        setDisplayedText(COMMAND.slice(0, index));
        timeout = setTimeout(() => typeChar(index + 1), 1000 / 18); // 18 chars per second
      } else {
        setIsTyping(false);
        timeout = setTimeout(() => {
          setShowOutput(true);
          showLine(0);
        }, 400);
      }
    };

    const showLine = (index: number) => {
      if (index <= OUTPUT_LINES.length) {
        setVisibleLines(index);
        timeout = setTimeout(() => showLine(index + 1), 60); // 60ms per line
      } else {
        // Reset after a delay to loop
        timeout = setTimeout(() => {
          setDisplayedText('');
          setIsTyping(true);
          setVisibleLines(0);
          setShowOutput(false);
          typeChar(0);
        }, 5000);
      }
    };

    typeChar(0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(242,34,131,0.12),0_8px_24px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.06)] bg-white font-mono text-left">
      {/* Title bar */}
      <div className="h-10 md:h-12 bg-[#F5F5F5] border-b border-black/5 flex items-center px-4 md:px-5 shrink-0">
        {/* Traffic lights */}
        <div className="flex gap-2">
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-[#28C840]" />
        </div>
        {/* Título centrado */}
        <div className="flex-1 text-center">
          <span className="font-sans text-xs md:text-sm font-medium text-[#666666]">
            Terminal — AI BORA
          </span>
        </div>
        <div className="w-[52px]" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 bg-white p-5 md:p-8 text-sm md:text-base lg:text-lg font-medium overflow-hidden">
        {/* Linha do comando */}
        <div className="flex items-center text-[#1A1A1A] flex-wrap">
          <span className="text-[#F22283] font-bold">~</span>
          <span className="text-[#F25C05] font-bold mx-2 md:mx-3">$</span>
          <span className="text-[#1A1A1A] break-all">{displayedText}</span>
          {!showOutput && (
            <motion.span
              animate={{ opacity: isTyping ? 1 : [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: isTyping ? 0 : Infinity }}
              className="inline-block w-2 md:w-3 h-4 md:h-5 bg-[#F22283] ml-1 rounded-sm"
            />
          )}
        </div>

        {/* Output */}
        {showOutput && (
          <div className="mt-4 md:mt-5 leading-relaxed text-[#333333]">
            {OUTPUT_LINES.slice(0, visibleLines).map((line, i) => {
              const isCheckmark = line.includes("✓");
              const isFinal = line.includes("online");
              const isPack = line.includes("Pack");

              let color = "#444444";
              let fontWeight = 500;

              if (isCheckmark) {
                color = "#28C840";
                fontWeight = 700;
              } else if (isFinal) {
                color = "#F22283";
                fontWeight = 700;
              } else if (isPack) {
                color = "#F25C05";
                fontWeight = 700;
              }

              return (
                <div key={i} style={{ color, fontWeight }} className="whitespace-pre-wrap">
                  {line || " "}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
