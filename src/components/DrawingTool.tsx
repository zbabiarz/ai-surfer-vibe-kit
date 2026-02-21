import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import { Eraser, Trash2, Pencil, Type, Save, Image, X, Palette } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface DrawingToolProps {
  userId: string;
  onSave?: (dataUrl: string) => void;
}

interface TextNode {
  x: number;
  y: number;
  text: string;
  id: string;
}

interface Sketch {
  id: string;
  name: string;
  data: string;
  created_at: string;
}

const DrawingTool = ({ userId, onSave }: DrawingToolProps) => {
  const [lines, setLines] = useState<any[]>([]);
  const [isErasing, setIsErasing] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [textNodes, setTextNodes] = useState<TextNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [saving, setSaving] = useState(false);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    loadSketches();
  }, [userId]);

  const loadSketches = async () => {
    try {
      const { data, error } = await supabase
        .from('sketches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSketches(data || []);
    } catch (error) {
      console.error('Error loading sketches:', error);
      toast.error('Failed to load sketches');
    }
  };

  const saveSketch = async () => {
    const name = window.prompt('Enter a name for your sketch:');
    if (!name) return;

    try {
      setSaving(true);
      const stage = stageRef.current;
      if (!stage) return;

      const data = {
        lines,
        textNodes,
      };

      const { error } = await supabase
        .from('sketches')
        .insert({
          user_id: userId,
          name,
          data: JSON.stringify(data),
        });

      if (error) throw error;

      toast.success('Sketch saved!');
      loadSketches();
    } catch (error) {
      console.error('Error saving sketch:', error);
      toast.error('Failed to save sketch');
    } finally {
      setSaving(false);
    }
  };

  const loadSketch = (sketch: Sketch) => {
    try {
      const data = JSON.parse(sketch.data);
      setLines(data.lines || []);
      setTextNodes(data.textNodes || []);
      toast.success('Sketch loaded!');
    } catch (error) {
      console.error('Error loading sketch:', error);
      toast.error('Failed to load sketch');
    }
  };

  const deleteSketch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sketch?')) return;

    try {
      const { error } = await supabase
        .from('sketches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSketches(sketches.filter(s => s.id !== id));
      toast.success('Sketch deleted!');
    } catch (error) {
      console.error('Error deleting sketch:', error);
      toast.error('Failed to delete sketch');
    }
  };

  const handleMouseDown = () => {
    if (isTextMode) return;
    isDrawing.current = true;
    setLines([...lines, { points: [], strokeWidth, isEraser: isErasing }]);
  };

  const handleMouseMove = (e: any) => {
    if (isTextMode) return;
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    lastLine.points = [...lastLine.points, point.x, point.y];
    setLines([...lines.slice(0, -1), lastLine]);
  };

  const handleMouseUp = () => {
    if (isTextMode) return;
    isDrawing.current = false;
    if (onSave) {
      const stage = stageRef.current;
      if (stage) {
        const dataUrl = stage.toDataURL();
        onSave(dataUrl);
      }
    }
  };

  const clearCanvas = () => {
    setLines([]);
    setTextNodes([]);
    toast.success('Canvas cleared');
  };

  const toggleEraser = () => {
    setIsTextMode(false);
    setIsErasing(!isErasing);
    setStrokeWidth(isErasing ? 2 : 20);
    toast.success(isErasing ? 'Pencil selected' : 'Eraser selected');
  };

  const toggleTextMode = () => {
    setIsTextMode(!isTextMode);
    setIsErasing(false);
    toast.success(isTextMode ? 'Drawing mode' : 'Text mode');
  };

  const handleStageClick = (e: any) => {
    if (!isTextMode) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const text = window.prompt('Enter text:');
    if (text) {
      const newTextNode: TextNode = {
        x: point.x,
        y: point.y,
        text,
        id: `text-${Date.now()}`,
      };
      setTextNodes([...textNodes, newTextNode]);
    }
  };

  const handleTextDragEnd = (e: any, id: string) => {
    const node = textNodes.find(n => n.id === id);
    if (node) {
      const newTextNodes = textNodes.map(n =>
        n.id === id ? { ...n, x: e.target.x(), y: e.target.y() } : n
      );
      setTextNodes(newTextNodes);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-xl border border-orange-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent flex items-center gap-2">
          <Palette className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          Sketch Your Ideas
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveSketch}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Sketch'}</span>
          </button>
          <button
            onClick={toggleTextMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-sm font-medium whitespace-nowrap ${
              isTextMode
                ? 'bg-gradient-to-r from-brand-400 to-accent1-400 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
          <button
            onClick={toggleEraser}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-sm font-medium whitespace-nowrap ${
              isErasing
                ? 'bg-gradient-to-r from-brand-400 to-accent1-400 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {isErasing ? <Eraser className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            <span>{isErasing ? 'Eraser' : 'Pencil'}</span>
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-inner bg-white">
        <Stage
          ref={stageRef}
          width={window.innerWidth < 768 ? window.innerWidth - 64 : 700}
          height={500}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onClick={handleStageClick}
          onMouseleave={handleMouseUp}
          style={{ background: '#fff' }}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.isEraser ? '#fff' : '#000'}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.isEraser ? 'destination-out' : 'source-over'
                }
              />
            ))}
            {textNodes.map((textNode) => (
              <Text
                key={textNode.id}
                x={textNode.x}
                y={textNode.y}
                text={textNode.text}
                fontSize={16}
                draggable
                onDragEnd={(e) => handleTextDragEnd(e, textNode.id)}
                fill="#000"
                padding={4}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {sketches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Saved Sketches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sketches.map((sketch) => (
              <div
                key={sketch.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-750 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">{sketch.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadSketch(sketch)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-brand-400 to-accent1-400 hover:from-brand-500 hover:to-accent1-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md font-medium whitespace-nowrap"
                  >
                    <Image className="w-4 h-4" />
                    Load
                  </button>
                  <button
                    onClick={() => deleteSketch(sketch.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md font-medium whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { DrawingTool };
