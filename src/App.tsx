import {
  useEffect,
  useState,
  useRef,
  createElement,
  RefObject,
  createRef,
  useCallback,
} from 'react';
import { nanoid } from 'nanoid';
import { changeProps } from 'find-and';

interface newDivProps {
  startPosition: {
    x: number;
    y: number;
  };
  endPosition: {
    x: number;
    y: number;
  };
}

interface DragPosition {
  x: number;
  y: number;
}

/**
 * =========== From webshape
 */

/**
 * Available block types
 */
enum HtmlContainerTypes {
  div = 'div',
  section = 'section',
}
enum HtmlContentTypes {
  p = 'p',
  h1 = 'h1',
  h2 = 'h2',
  img = 'img',
}

/**
 * All block types extends this
 */
type BaseBlock = {
  id: string;
  classList: string[];
  style?: React.CSSProperties;
  ref?: RefObject<any>;
};

/**
 * All html container-like blocks
 */
interface ContainerBlock extends BaseBlock {
  type: keyof typeof HtmlContainerTypes;
  children: Block[];
}

/**
 * All html content-like blocks
 */
interface ContentBlock extends BaseBlock {
  type: keyof typeof HtmlContentTypes;
  data: JSX.Element | string;
}

/**
 * A single block is either a container or content block
 */
type Block = ContainerBlock | ContentBlock;

/**
 * RequiredJSX Block Component Props
 */
interface BlockProps {
  className: string;
  key: string;
  'data-block-id': string;
  style?: React.CSSProperties;
}

/**
 * This function will recursively build JSX from array passed in.
 * Adds a few elements to html depending on block type
 */
const generateJSX = (blocks: Block[]): (JSX.Element | undefined)[] => {
  return blocks.map((block) => {
    const isContainerType = Object.values(HtmlContainerTypes).includes(
      block.type as HtmlContainerTypes
    );

    const blockProps: BlockProps = {
      className: block.classList.join(' '),
      key: block.id,
      'data-block-id': block.id,
      ...(block.style ? { style: block.style } : null),
    };

    return createElement(
      block.type,
      blockProps,
      isContainerType
        ? generateJSX((block as ContainerBlock).children)
        : (block as ContentBlock).data
    );
  });
};

const defaultBlocks: Block[] = [
  {
    id: '1018493',
    type: HtmlContainerTypes.div,
    classList: ['bg-red-400'],
    children: [],
  },
];

/**
 * ============ End
 */

const ExampleComponent = () => {
  const [state, setState] = useState(Date.now().toString());
  return (
    <div>
      <p>Ayooo I'm a component {state}</p>
      <button onClick={() => setState(Date.now().toString())}>
        Update State
      </button>
    </div>
  );
};

export const App = () => {
  console.log('TEST | App rendering...');
  const [blocks, setBlocks] = useState(defaultBlocks);
  const [status, setStatus] = useState<
    'idle' | 'initialized' | 'dragging' | 'ended'
  >('idle');
  const [test, setTest] = useState(Date.now().toString());

  const mainRef = useRef<HTMLDivElement>(null);
  const newDivRef = useRef<{ id: string | null }>({ id: null });

  const addBlock = (blockHeight: number) => {
    console.log('TEST | Adding block...');
    const newBlockId = nanoid();

    newDivRef.current!.id = newBlockId;

    const newBlock: Block = {
      id: newBlockId,
      type: HtmlContainerTypes.div,
      classList: [
        'bg-pink-500',
        'w-full',
        'flex',
        'items-center',
        'justify-center',
        'h-24',
      ],
      style: {
        height: `${blockHeight}px`,
      },
      children: [
        {
          id: nanoid(),
          type: HtmlContentTypes.p,
          classList: ['w-1/2', 'h-1/2', 'bg-green-500'],
          data: <ExampleComponent />,
        },
      ],
    };
    setBlocks((currentBlocks) => [...currentBlocks, newBlock]);
  };

  const updateBlock = (id: string, { ...rest }) => {
    console.log(`TEST | updateBlock (${id}) with...`, rest);
    setBlocks((current) => [
      ...changeProps(current, { id }, { style: rest.style }),
    ]);
  };

  useEffect(() => {
    console.log('TEST | useEffect running...');

    if (!mainRef.current) {
      console.log('TEST | Skipping adding mousedown event listener...');
    }

    const initDrag = (e: MouseEvent) => {
      console.log('TEST | mousedown event listener created...');
      console.log(`TEST | mouse position at (${e.clientX},${e.clientY})`);

      addBlock(e.clientY);

      setStatus('initialized');
      mainRef.current!.addEventListener('mousemove', dragging, false);
      mainRef.current!.addEventListener('mouseup', dragEnd, false);
    };

    const dragging = (e: MouseEvent) => {
      console.log('TEST | mouse is moving...');
      const newBlock = document.querySelector(
        `[data-block-id="${newDivRef.current!.id}"]`
      ) as HTMLElement;
      setStatus('dragging');
      newBlock.style.height = `${e.clientY}px`;
    };

    const dragEnd = (e: MouseEvent) => {
      console.log('TEST | mouse up..');
      mainRef.current!.removeEventListener('mousemove', dragging, false);
      mainRef.current!.removeEventListener('mouseup', dragEnd, false);
      updateBlock(newDivRef.current!.id as string, {
        style: {
          height: `${e.clientY}px`,
        },
      });
      setStatus('ended');
      newDivRef.current!.id = null;
    };

    mainRef.current!.addEventListener('mousedown', initDrag, false);
  }, []);

  useEffect(() => {
    console.log('TEST | blocks have been updated...', { blocks });
  }, [blocks]);

  return (
    <>
      <div
        ref={mainRef}
        className="w-screen h-[calc(100vh_-_100px)] bg-slate-200"
      >
        <>{generateJSX(blocks)}</>
      </div>
      Status: {status}
      <br />
      <button onClick={() => setTest(Date.now().toString())}>Test</button>:{' '}
      {test}
    </>
  );
};
