import { BookPart } from '../types';

export interface BookPartInfo {
  title: string;
  description: string;
  historicalNote: string;
}

export const bookPartsData: Record<BookPart, BookPartInfo> = {
  cover: {
    title: "Cover Boards",
    description: "The rigid front and back panels that protect the book's interior. Made from thick cardboard or binder's board, they're covered with cloth, leather, or paper to create the book's exterior appearance.",
    historicalNote: "Medieval books used wooden boards, sometimes weighing several pounds, which is why we still call them 'boards' today."
  },
  
  spine: {
    title: "Spine",
    description: "The backbone of the book that connects the front and back covers. It houses the binding structure and displays the book's title for shelf identification.",
    historicalNote: "Before the 16th century, books were stored flat or with the fore-edge facing out, making spine titles unnecessary."
  },
  
  textblock: {
    title: "Text Block",
    description: "The assembled pages of the book, sewn or glued together before being attached to the cover. This forms the core content-bearing element of the book.",
    historicalNote: "A single text block can contain over 500 individual folded sheets, each requiring precise alignment during binding."
  },
  
  headband: {
    title: "Headband",
    description: "A decorative and structural element at the top of the spine that reinforces the connection between the text block and cover while adding aesthetic appeal.",
    historicalNote: "Originally functional to prevent thread damage, headbands became purely decorative in modern commercial binding around the 1800s."
  },
  
  tailband: {
    title: "Tailband",
    description: "The counterpart to the headband, located at the bottom of the spine. It provides symmetrical reinforcement and visual balance to the book's construction.",
    historicalNote: "In fine binding, headbands and tailbands are hand-sewn with silk thread in contrasting colors, a practice dating back to medieval manuscripts."
  },
  
  endpapers: {
    title: "Endpapers",
    description: "Decorative sheets that connect the text block to the cover boards. They serve both functional and aesthetic purposes, often featuring marbled or patterned designs.",
    historicalNote: "Marbled endpapers became popular in the 17th century, with each pattern being completely unique due to the hand-crafted water-floating technique."
  },
  
  dustjacket: {
    title: "Dust Jacket",
    description: "A protective and promotional wrapper that covers the book's exterior. Originally purely functional, it now serves as the primary marketing surface with artwork and text.",
    historicalNote: "Dust jackets were introduced in the early 1800s as disposable covers, but became collectible art pieces by the 20th century."
  },
  
  bookmark: {
    title: "Bookmark Ribbon",
    description: "A fabric ribbon permanently attached to the spine that allows readers to mark their place without damaging pages. Also called a 'register ribbon' or 'page marker'.",
    historicalNote: "Bookmark ribbons were first used in medieval religious texts and were often made from expensive silk as a sign of the book's value."
  },
  
  sewing: {
    title: "Sewing Structure",
    description: "The thread system that binds individual signatures (folded page sections) together through the spine. This creates a flexible, durable connection that allows the book to open flat.",
    historicalNote: "Traditional bookbinding uses a technique called 'kettle stitch' that dates back over 2,000 years to ancient Roman codices."
  }
};
