import { Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function Skills() {
  const { data: skills = [], isLoading, error } = useQuery({
    queryKey: ['adminSkills'],
    queryFn: async () => {
      const response = await api.get('/admin/skills');
      return response.data;
    }
  });

  if (isLoading) return <div>Loading skills...</div>;
  if (error) return <div>Error loading skills data</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills Database</h1>
          <p className="text-gray-500 mt-1">Maintain the global database of skills for candidates and jobs.</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          {!Array.isArray(skills) || skills.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No skills found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {skills.map((skill: any) => (
                <div key={skill.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <h3 className="font-bold text-gray-900">{skill.name}</h3>
                  <div className="flex justify-between text-sm text-gray-500 mt-3 border-t border-gray-100 pt-3">
                    <div>
                      <span className="font-medium text-gray-900">{skill._count?.candidates ?? 0}</span> Candidates
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{skill._count?.jobSkills ?? 0}</span> Jobs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
