module EOL
  module Api
    module Ggi
      class V1_0 < EOL::Api::MethodVersion
        VERSION = '1.0'
        BRIEF_DESCRIPTION = ""
        DESCRIPTION = ""
        PARAMETERS = Proc.new {
          [
            EOL::Api::DocumentationParameter.new(
              :name => 'id',
              :type => Integer,
              :required => true)
          ] }

        def self.call(params={})
          validate_and_normalize_input_parameters!(params)
          begin
            taxon_concept = TaxonConcept.find(params[:id])
          rescue
            raise ActiveRecord::RecordNotFound.new("Unknown page id \"#{params[:id]}\"")
          end
          raise ActiveRecord::RecordNotFound.new("Page \"#{params[:id]}\" is no longer available") if !taxon_concept.published?
          prepare_hash(taxon_concept, params)
        end

        def self.prepare_hash(taxon_concept, params={})
          return_hash = {}
          unless taxon_concept.nil?
            return_hash['identifier'] = taxon_concept.id
            return_hash['scientificName'] = taxon_concept.entry.name.string
            return_hash['taxonRank'] = taxon_concept.entry.rank ? taxon_concept.entry.rank.label : nil
            best_image = taxon_concept.exemplar_or_best_image_from_solr
            return_hash['bestImage'] = best_image ? EOL::Api::DataObjects::V1_0.prepare_hash(best_image, details: true) : {}

            return_hash['ancestors'] = []
            taxon_concept.entry.kingdom_and_immediate_parent.each do |entry|
              next unless entry
              return_hash['ancestors'] << {
                'identifier' => entry.taxon_concept_id,
                'scientificName' => entry.name.string,
                'taxonRank' => entry.rank ? entry.rank.label : nil
              }
            end

            return_hash['vernacularNames'] = []
            taxon_concept.common_names.each do |tcn|
              lang = tcn.language ? tcn.language.iso_639_1 : ''
              common_name_hash = {
                'vernacularName' => tcn.name.string,
                'language'       => lang
              }
              preferred = (tcn.preferred == 1) ? true : nil
              common_name_hash['eol_preferred'] = preferred unless preferred.blank?
              return_hash['vernacularNames'] << common_name_hash
            end

            return_hash['measurements'] = []
            taxon_data = TaxonPage.new(taxon_concept, nil).data.data_for_ggi
            taxon_data.each do |result_hash|
              return_hash['measurements'] << {
                'resourceID' => result_hash[:resource].id,
                'source' => result_hash[:resource].title,
                'measurementType' => result_hash[:attribute].uri,
                'label' => result_hash[:attribute].name,
                'measurementValue' => result_hash[:value].to_s.to_i,
                'score' => rand(0.. 1.0).round(2)
              }
            end

            ######
            return_hash['number_of_families'] = 11
            return_hash['namePublishedIn'] = "Chaimanee, Y., D. Jolly, M.Benammi, P.Tafforeau, D. Duzer, I.Moussa, and J.-J. Jaeger. 2003. A Middle Miocene hominoid from Thailand and orangutan origins. Nature 422(6927):61-65."
            return_hash['ggiTotalScore'] = taxon_concept.taxon_concept_metric ? taxon_concept.taxon_concept_metric.richness_score : 0
          end
          return return_hash
        end
      end
    end
  end
end