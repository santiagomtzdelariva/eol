require File.dirname(__FILE__) + '/../spec_helper'

require File.dirname(__FILE__) + '/../../lib/eol_data'
class EOL::NestedSet; end
EOL::NestedSet.send :extend, EOL::Data

# TODO get rid of this!  extract out of here ... used this to initially get this spec working (need to create TaxonConcepts)
class SearchSpec
  class << self

    def recreate_normalized_names_and_links
      NormalizedName.truncate
      NormalizedLink.truncate
      Name.all.each {|name| NormalizedLink.parse! name }
    end

    def animal_kingdom
      @animal_kingdom ||= make_a_taxon 'Animals', 0, 0
    end

    # trying to define the smallest about of data required to have a valid taxon concept that i can search for
    def make_a_taxon name, parent_id, depth = 1

      # we need Names ... both of which need a canonical_form ...
      canonical_form  = CanonicalForm.gen :string => name
      scientific_name = Name.gen :canonical_form => canonical_form, :string => name.downcase, :italicized => "<i>#{ name.downcase }</i>"
      common_name     = Name.gen :canonical_form => canonical_form, :string => name.upcase,   :italicized => "<i>#{ name.upcase }</i>"

      # make the actual TaxonConcept ... doesn't have much data, itself
      taxon_concept   = TaxonConcept.gen

      hierarchy_entry = HierarchyEntry.gen :hierarchy => Hierarchy.default,
                                           :parent_id     => parent_id,
                                           :depth         => depth,
                                           :rank_id       => depth + 1,
                                           :taxon_concept => taxon_concept,
                                           :name          => scientific_name

      # associate names with TaxonConcept
      TaxonConceptName.gen :preferred                 => true, 
                           :vern                      => false, 
                           :source_hierarchy_entry_id => hierarchy_entry.id, 
                           :language                  => Language.english,
                           :name                      => scientific_name, 
                           :taxon_concept             => taxon_concept

      TaxonConceptName.gen :preferred                 => true, 
                           :vern                      => true, 
                           :source_hierarchy_entry_id => hierarchy_entry.id, 
                           :language                  => Language.english,
                           :name                      => common_name, 
                           :taxon_concept             => taxon_concept
      
      # is a taxon actually required?
      taxon = Taxon.gen :name => scientific_name, :hierarchy_entry => hierarchy_entry, :scientific_name => canonical_form

      # trust the taxon_concept, by default
      taxon_concept.vetted = Vetted.trusted
      taxon_concept.published = 1
      taxon_concept.save

      taxon_concept
    end

    def nestify_everything_properly
      # for each Hierarchy, go and set the lft/rgt on all of this child nodes properly
      EOL::NestedSet.make_all_nested_sets
    end

  end
end

describe 'Search' do

  before :each do
    truncate_all_tables
    Scenario.load :foundation
  end

  it 'should return a helpful message if no results' do
    TaxonConcept.count.should == 0

    request('/search?q=tiger').body.should include("Your search on 'tiger' did not find any matches")
  end

  it 'should redirect to species page if only 1 possible match is found' do
    TaxonConcept.count.should == 0

    tiger = SearchSpec.make_a_taxon 'Tiger', SearchSpec.animal_kingdom.id
    SearchSpec.nestify_everything_properly
    SearchSpec.recreate_normalized_names_and_links

    request('/search?q=tiger').should redirect_to("/pages/#{ tiger.id }")
  end

  it 'should show a list of possible results if more than 1 match is found'
  
end
