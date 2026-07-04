import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, FileText, Plus, Edit2, Trash2, Globe, Eye } from 'lucide-react';

export default function RecipesList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs') // Still using the blogs table in backend
        .select(`
          *,
          profiles:author_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipe Management</h1>
          <p className="text-sm text-gray-500">Publish recipes and cultural stories related to your pickles.</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Recipe
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="p-4">Recipe Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4">Published Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Loading recipes...</td>
                </tr>
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-900 font-medium">No recipes found</p>
                      <p className="text-gray-500 text-sm mt-1">Start writing your first delicious recipe.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{recipe.title}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate w-64">{recipe.excerpt}</p>
                    </td>
                    <td className="p-4 text-gray-600">
                      {recipe.profiles?.name || 'Unknown'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        recipe.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recipe.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-2 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
