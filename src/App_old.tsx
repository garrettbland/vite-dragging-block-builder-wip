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
  data: string;
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

export const App = () => {
  console.log('TEST | Component Rendering...');
  const mainRef = useRef<HTMLDivElement>(null);
  const newDiv = useRef<newDivProps | null>(null);

  const newElementId = useRef<string>('');
  const dragStart = useRef<DragPosition>({ x: 0, y: 0 });
  const dragEnd = useRef<DragPosition>({ x: 0, y: 0 });

  const [status, setStatus] = useState<'idle' | 'started' | 'ended'>('idle');
  const [blocks, setBlocks] = useState(defaultBlocks);

  const newBlockId = useRef<string | null>(null);

  useEffect(() => {
    if (!mainRef.current) return;

    document.addEventListener('mousedown', initializeDrag, false);

    return () => {
      document?.removeEventListener('mousedown', initializeDrag, false);
    };
  }, []);

  const initializeDrag = useCallback((event: MouseEvent) => {
    setStatus('started');
    console.log(
      `TEST | Start coordinates: (${event.clientX}, ${event.clientY})`
    );

    // const newEmptyContainer = document.createElement('div');
    // newEmptyContainer.style.width = '50%';
    // newEmptyContainer.style.height = '50%';
    // newEmptyContainer.classList.add('bg-green-500');

    // newElementId.current = Date.now().toString();

    // const newDivElement = document.createElement('div');
    // newDivElement.id = `${newElementId.current}`;
    // newDivElement.style.position = 'absolute';
    // newDivElement.classList.add(
    //   'flex',
    //   'items-center',
    //   'justify-center',
    //   'bg-pink-500'
    // );

    // newDivElement.appendChild(newEmptyContainer);

    const newSectionId = nanoid();

    const newBlock: Block = {
      id: newSectionId,
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
        height: `${event.clientY}px`,
      },
      children: [
        {
          id: nanoid(),
          type: HtmlContentTypes.p,
          classList: ['w-1/2', 'h-1/2', 'bg-green-500'],
          data: 'Woot a new child boi',
        },
      ],
    };
    setBlocks((currentBlocks) => [...currentBlocks, newBlock]);

    /**
     * These start the div wherever the mouse starts
     */
    // newDivElement.style.top = `${event.clientY}px`;
    // newDivElement.style.left = `${event.clientX}px`;

    /**
     * The top and bottom here are testing out my idea
     */
    // newDivElement.style.top = '0px';
    // newDivElement.style.left = '0px';

    /**
     * Default size when dragging start
     */
    // newDivElement.style.width = '10px'
    // newDivElement.style.height = `10px`;

    /**
     * The top and bottom here are testing out my idea
     */
    // newDivElement.style.width = '100%';
    // newDivElement.style.height = `0px`;

    // mainRef.current!.appendChild(newDivElement);

    dragStart.current = { x: event.clientX, y: event.clientY };

    document.addEventListener(
      'mousemove',
      (e) => {
        console.log('TEST | creating new event listener for mousemove');
        startDragging(e, newSectionId);
      },
      false
    );
    document.addEventListener(
      'mouseup',
      (e) => {
        console.log('TEST | creating new event listener for mouseup');
        endDragging(e, newSectionId);
      },
      false
    );
  }, []);

  const startDragging = useCallback(
    (event: MouseEvent, newBlockId = '12312') => {
      console.log('TEST | Start dragging for...', newBlockId);
      console.log('TEST | current blocks', { blocks });

      const divWidth = event.clientX - dragStart.current.x;
      const divHeight = event.clientY - dragStart.current.y;

      // const newDivE = document.getElementById(`${newElementId.current}`);
      const newDivE = document.querySelector(`[data-block-id="${newBlockId}"]`);

      /**
       * Dynamically creates div size and location
       */
      // newDivE!.style.width = `${divWidth}px`;
      // newDivE!.style.height = `${divHeight}px`;

      /**
       * Testing out idea
       */
      newDivE!.style.height = `${event.clientY}px`;

      dragEnd.current = { x: event.clientX, y: event.clientY };
    },
    []
  );

  const endDragging = useCallback((event: MouseEvent, newBlockId = '32323') => {
    console.log('TEST | End dragging for...', newBlockId);
    // console.log({ dragStart });
    // console.log({ dragEnd });

    // const newBlock: Block = {
    //   id: nanoid(),
    //   type: HtmlContainerTypes.div,
    //   classList: [
    //     'bg-pink-500',
    //     'w-full',
    //     'flex',
    //     'items-center',
    //     'justify-center',
    //   ],
    //   style: {
    //     height: `${event.clientY}px`,
    //   },
    //   children: [
    //     {
    //       id: nanoid(),
    //       type: HtmlContentTypes.p,
    //       classList: ['w-1/2', 'h-1/2', 'bg-green-500'],
    //       data: 'Woot a new child boi',
    //     },
    //   ],
    // };

    console.log('TEST | end dragging for block with id:', newBlockId);
    console.log('TEST | current blocks', { blocks });

    const updatedBlocks = changeProps(
      blocks,
      { id: newBlockId },
      { style: { height: `${event.clientY}px` } }
    );

    console.log('TEST | updated Blocks', { updatedBlocks });

    setBlocks((current) => [...current]);

    // const newDivE = document.getElementById(`${newElementId.current}`);
    // newDivE!.remove();

    // dragEnd.current = { x: event.clientX, y: event.clientY };

    // const divWidth = dragEnd.current.x - dragStart.current.x;
    // const divHeight = dragEnd.current.y - dragStart.current.y;

    // const newDivE = document.getElementById(newElementId.current);
    /**
     * Leave this in for creating divs with dynamic height/width and location
     */
    // newDivE!.style.width = `${divWidth}px`;
    // newDivE!.style.height = `${divHeight}px`;

    // newElementId.current = '';
    dragStart.current = { x: 0, y: 0 };
    dragEnd.current = { x: 0, y: 0 };

    setStatus('ended');

    document.removeEventListener('mousemove', startDragging, false);
    document.removeEventListener('mouseup', endDragging, false);
  }, []);

  // const updateDiv = ({ width, height }: { width: number; height: number }) => {
  //   console.log(
  //     `Create new div with a width of ${width} and height of ${height}`
  //   );

  //   newDivElement.style.width = `${width}px`;
  //   newDivElement.style.height = `${height}px`;

  //   console.log(newDivElement);

  //   mainRef.current!.appendChild(newDivElement);
  // };

  return (
    <>
      <div
        ref={mainRef}
        className="w-screen h-[calc(100vh_-_100px)] bg-slate-200"
      >
        <>{generateJSX(blocks)}</>
      </div>
      Status: {status}
    </>
  );
};

// import { useState } from 'react';
// import { Resizable } from 're-resizable';

// function App() {
//   const [count, setCount] = useState(0);

//   return (
//     <>
//       {/* <div className="bg-red-100 flex items-center justify-center">
//         <div className="flex p-4 bg-red-300">
//           <div className="bg-green-100 p-4 space-y-5">
//             <h1 className="text-4xl font-black">Call to Action</h1>
//             <p className="text-lg text-slate-700">
//               This is some description text about stuff.
//             </p>
//           </div>
//           <div className="bg-yellow-200 p-4">
//             <img
//               src="https://images.unsplash.com/photo-1662061494860-b0938851545d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80"
//               className="object-cover h-[100px] w-[100%]"
//             />
//           </div>
//         </div>
//       </div> */}
//       {/* <Resizable className="bg-red-100 flex items-center justify-center">
//         <Resizable
//           className="flex p-4 bg-red-300"
//           defaultSize={{ height: 'auto', width: '80%' }}
//         >
//           <Resizable
//             className="bg-green-100 p-4 space-y-5"
//             defaultSize={{
//               height: 'auto',
//               width: '50%',
//             }}
//             minWidth="20%"
//             maxWidth="80%"
//           >
//             <h1 className="text-4xl font-black">Call to Action</h1>
//             <p className="text-lg text-slate-700">
//               This is some description text about stuff.
//             </p>
//           </Resizable>
//           <div
//             className="bg-yellow-200 p-4"
//             style={{ width: '100%', minHeight: '200px' }}
//           >
//             <img
//               src="https://images.unsplash.com/photo-1662061494860-b0938851545d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80"
//               className="object-cover h-full w-full"
//             />
//           </div>
//         </Resizable>
//       </Resizable> */}
//       {/* <Resizable
//         className="bg-red-200 flex items-center justify-center"
//         enable={{
//           top: false,
//           right: false,
//           bottom: true,
//           left: false,
//           topRight: false,
//           bottomRight: false,
//           bottomLeft: false,
//           topLeft: false,
//         }}
//       ></Resizable> */}
//     </>
//   );
// }

// export default App;
