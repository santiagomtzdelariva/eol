# A curated, translated relationship between a URI and a "human-readable" string describing the intent of the URI.
# I'm going to use Curatable for now, even though vetted probably won't ever be used. ...It might be, and it makes
# this easier than splitting up that class.
#
# TODO - this class has gotten too large. Break it up. In particular, I notice there are a LOT of class methods. Perhaps that logic belongs
# elsewhere.
class KnownUri < ActiveRecord::Base

  BASE = Rails.configuration.uri_term_prefix
  TAXON_RE = Rails.configuration.known_taxon_uri_re
  GRAPH_NAME = Rails.configuration.known_uri_graph

  include EOL::CuratableAssociation

  acts_as_list

  uses_translations

  self.per_page = 100

  belongs_to :vetted
  belongs_to :visibility
  belongs_to :uri_type

  has_many :translated_known_uris
  has_many :user_added_data
  has_many :known_uri_relationships_as_subject, :class_name => KnownUriRelationship.name, :foreign_key => :from_known_uri_id
  has_many :known_uri_relationships_as_target, :class_name => KnownUriRelationship.name, :foreign_key => :to_known_uri_id

  has_and_belongs_to_many :toc_items

  attr_accessible :uri, :visibility_id, :vetted_id, :visibility, :vetted, :translated_known_uri,
    :translated_known_uris_attributes, :toc_items, :toc_item_ids, :description, :uri_type, :uri_type_id,
    :translations, :exclude_from_exemplars, :name, :known_uri_relationships_as_subject

  accepts_nested_attributes_for :translated_known_uris

  validates_presence_of :uri
  validates_uniqueness_of :uri
  validate :uri_must_be_uri

  before_validation :default_values

  scope :excluded_from_exemplars, -> { where(exclude_from_exemplars: true) }
  scope :measurements, -> { where(uri_type_id: UriType.measurement.id) }
  scope :values, -> { where(uri_type_id: UriType.value.id) }
  scope :associations, -> { where(uri_type_id: UriType.association.id) }
  scope :metadata, -> { where(uri_type_id: UriType.metadata.id) }

  COMMON_URIS = [ { uri: Rails.configuration.uri_measurement_unit, name: 'unit_of_measure' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000022', name: 'milligrams' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000021', name: 'grams' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000009', name: 'kilograms' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000016', name: 'millimeters' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000081', name: 'centimeters' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000008', name: 'meters' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000012', name: 'kelvin' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000027', name: 'celsius' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000033', name: 'days' },
                  { uri: Rails.configuration.uri_obo + 'UO_0000036', name: 'years' }]

  COMMON_URIS.each do |info|
    eigenclass = class << self; self; end
    eigenclass.class_eval do
      define_method(info[:name]) do
        return class_variable_get("@@#{info[:name]}".to_sym) if class_variable_defined?("@@#{info[:name]}".to_sym)
        class_variable_set("@@#{info[:name]}".to_sym, cached_find(:uri, info[:uri]))
      end
    end
  end

  def self.create_for_language(options = {})
    uri = KnownUri.create(uri: options.delete(:uri))
    if uri.valid?
      trans = TranslatedKnownUri.create(options.merge(known_uri: uri))
    end
    uri
  end

  def self.license
    cached_find_translated(:name, 'License')
  end

  def self.custom(name, language)
    known_uri = KnownUri.find_or_create_by_uri(BASE + EOL::Sparql.to_underscore(name))
    translated_known_uri =
      TranslatedKnownUri.where(name: name, language_id: language.id, known_uri_id: known_uri.id).first
    translated_known_uri ||= TranslatedKnownUri.create(name: name, language: language, known_uri: known_uri)
    known_uri
  end

  def self.taxon_concept_id(val)
    match = val.to_s.scan(TAXON_RE)
    if match.empty?
      false
    else
      match.first.second # Where the actual first matching group is stored.
    end
  end

  def self.unknown_uris_from_array(uris_with_counts)
    unknown_uris_with_counts = uris_with_counts
    known_uris = KnownUri.find_all_by_uri(unknown_uris_with_counts.collect{ |uri,count| uri })
    known_uris.each do |known_uri|
      unknown_uris_with_counts.delete_if{ |uri, count| known_uri.matches(uri) }
    end
    unknown_uris_with_counts
  end

  def self.group_counts_by_uri(result)
    uris_with_counts = {}
    result.each do |r|
      uri = r[:uri].to_s
      next if uri.blank?
      uris_with_counts[uri] = r[:count].to_i
    end
    uris_with_counts
  end

  # TODO - move this to Virtuoso lib.
  def self.counts_of_all_measurement_unit_uris
    result = EOL::Sparql.connection.query("SELECT ?uri, COUNT(*) as ?count
      WHERE {
        ?measurement dwc:measurementUnit ?uri .
        FILTER (isURI(?uri))
      }
      GROUP BY ?uri
      ORDER BY DESC(?count)
    ")
    group_counts_by_uri(result)
  end

  # TODO - move this to Virtuoso lib.
  def self.counts_of_all_measurement_type_uris
    result = EOL::Sparql.connection.query("SELECT ?uri, COUNT(*) as ?count
      WHERE {
        ?measurement a <#{DataMeasurement::CLASS_URI}> .
        ?measurement dwc:measurementType ?uri .
        ?measurement <#{Rails.configuration.uri_measurement_of_taxon}> ?measurementOfTaxon .
        FILTER ( ?measurementOfTaxon = 'true' ) .
        FILTER (CONTAINS(str(?uri), '://'))
      }
      GROUP BY ?uri
      ORDER BY DESC(?count)
    ")
    group_counts_by_uri(result)
  end

  def self.all_measurement_type_uris
    @@all_measurement_type_uris = Rails.cache.fetch("known_uri/all_measurement_type_uris", :expires_in => 1.day) do
      counts_of_all_measurement_type_uris.collect{ |k,v| k }
    end
  end

  # TODO - move this to Virtuoso lib.
  def self.counts_of_all_measurement_value_uris
    result = EOL::Sparql.connection.query("SELECT ?uri, COUNT(*) as ?count
      WHERE {
        ?measurement a <#{DataMeasurement::CLASS_URI}> .
        ?measurement dwc:measurementValue ?uri .
        FILTER (CONTAINS(str(?uri), '://'))
      }
      GROUP BY ?uri
      ORDER BY DESC(?count)
    ")
    group_counts_by_uri(result)
  end

  # TODO - move this to Virtuoso lib.
  def self.counts_of_all_association_type_uris
    result = EOL::Sparql.connection.query("SELECT ?uri, COUNT(*) as ?count
      WHERE {
        ?association a <#{DataAssociation::CLASS_URI}> .
        ?association <#{Rails.configuration.uri_association_type}> ?uri .
        FILTER (CONTAINS(str(?uri), '://'))
      }
      GROUP BY ?uri
      ORDER BY DESC(?count)
    ")
    group_counts_by_uri(result)
  end

  def self.unknown_measurement_unit_uris
    unknown_uris_from_array(counts_of_all_measurement_unit_uris)
  end

  def self.unknown_measurement_type_uris
    unknown_uris_from_array(counts_of_all_measurement_type_uris)
  end

  def self.unknown_measurement_value_uris
    unknown_uris_from_array(counts_of_all_measurement_value_uris)
  end

  def self.unknown_association_type_uris
    unknown_uris_from_array(counts_of_all_association_type_uris)
  end

  def self.add_to_data(rows)
    known_uris = where(["uri in (?)", uris_in_data(rows)])
    preload_associations(known_uris, [ :uri_type, { :known_uri_relationships_as_subject => :to_known_uri },
      { :known_uri_relationships_as_target => :from_known_uri } ])
    rows.each do |row|
      replace_with_uri(row, :attribute, known_uris)
      replace_with_uri(row, :value, known_uris)
      replace_with_uri(row, :unit_of_measure_uri, known_uris)
      if row[:attribute].to_s == Rails.configuration.uri_association_type && taxon_id = taxon_concept_id(row[:value])
        row[:target_taxon_concept_id] = taxon_id
      end
    end
  end

  def self.uris_in_data(rows)
    uris  = rows.map { |row| row[:attribute] }.select { |attr| attr.is_a?(RDF::URI) }
    uris += rows.map { |row| row[:value] }.select { |attr| attr.is_a?(RDF::URI) }
    uris += rows.map { |row| row[:unit_of_measure_uri] }.select { |attr| attr.is_a?(RDF::URI) }
    uris.map(&:to_s).uniq
  end

  def self.replace_with_uri(hash, key, known_uris)
    uri = known_uris.find { |known_uri| known_uri.matches(hash[key]) }
    hash[key] = uri if uri
  end

  def allowed_values
    # using .select here instead of the scope .allowed_values as the scope does not work on preloaded relationships
    @allowed_values ||= known_uri_relationships_as_subject.select{ |r|
      r.relationship_uri == KnownUriRelationship::ALLOWED_VALUE_URI }.map(&:to_known_uri)
  end

  def allowed_units
    @allowed_units ||= known_uri_relationships_as_subject.select{ |r|
      r.relationship_uri == KnownUriRelationship::ALLOWED_UNIT_URI }.map(&:to_known_uri)
  end

  def has_values?
    ! allowed_values.empty?
  end

  def has_units?
    ! allowed_units.empty?
  end

  # these 3 methods may only be used in specs
  def add_value(value_known_uri)
    raise 'cannot add value to KnownUri' unless value_known_uri.is_a?(KnownUri) && value_known_uri != self
    KnownUriRelationship.gen_if_not_exists(:from_known_uri => self, :to_known_uri => value_known_uri,
      :relationship_uri => KnownUriRelationship::ALLOWED_VALUE_URI)
    # adding a new value for KnownUri.unit_of_measure requires we clear its cached instance
    KnownUri.remove_class_variable('@@unit_of_measure') if(self == KnownUri.unit_of_measure)
  end

  def add_unit(value_known_uri)
    raise 'cannot add value to KnownUri' unless value_known_uri.is_a?(KnownUri) && value_known_uri != self
    KnownUriRelationship.gen_if_not_exists(:from_known_uri => self, :to_known_uri => value_known_uri,
      :relationship_uri => KnownUriRelationship::ALLOWED_UNIT_URI)
  end

  def add_implied_unit(value_known_uri)
    raise 'cannot add value to KnownUri' unless value_known_uri.is_a?(KnownUri) && value_known_uri != self
    KnownUriRelationship.gen_if_not_exists(:from_known_uri => self, :to_known_uri => value_known_uri,
      :relationship_uri => KnownUriRelationship::MEASUREMENT_URI)
  end

  def unknown?
    name.blank?
  end

  def implied_unit_of_measure
    if unit_of_measure_relation = known_uri_relationships_as_subject.detect{ |r| r.relationship_uri == KnownUriRelationship::MEASUREMENT_URI }
      unit_of_measure_relation.to_known_uri
    end
  end

  def matches(other_uri)
    uri.casecmp(other_uri.to_s) == 0
  end

  def add_to_triplestore
    if known_uri_relationships_as_subject
      EOL::Sparql.connection.insert_data(data: [ turtle ], graph_name: KnownUri::GRAPH_NAME)
    end
  end

  def remove_from_triplestore
    EOL::Sparql.connection.delete_uri(graph_name: KnownUri::GRAPH_NAME, uri: uri)
    EOL::Sparql.connection.query("
      DELETE FROM <#{KnownUri::GRAPH_NAME}>
      { ?s <#{KnownUriRelationship::INVERSE_URI}> <#{uri}> }
      WHERE
      { ?s <#{KnownUriRelationship::INVERSE_URI}> <#{uri}> }")
  end

  def update_triplestore
    remove_from_triplestore
    add_to_triplestore
  end

  def turtle
    statements = []
    turtle = known_uri_relationships_as_subject.each do |r|
      statements << "<#{uri}> <#{r.relationship_uri}> <#{r.to_known_uri.uri}>"
      if r.relationship_uri == KnownUriRelationship::INVERSE_URI
        statements << "<#{r.to_known_uri.uri}> <#{r.relationship_uri}> <#{uri}>"
      end
    end
    turtle = known_uri_relationships_as_target.each do |r|
      if r.relationship_uri == KnownUriRelationship::INVERSE_URI
        statements << "<#{uri}> <#{r.relationship_uri}> <#{r.from_known_uri.uri}>"
        statements << "<#{r.from_known_uri.uri}> <#{r.relationship_uri}> <#{uri}>"
      end
    end
    statements.join(" . ")
  end

  def unit_of_measure?
    KnownUri.unit_of_measure.allowed_values.include?(self)
  end

  def anchor
    uri.to_s.gsub(/[^A-Za-z0-9]/, '_')
  end

  private

  def default_values
    self.vetted ||= Vetted.unknown
    self.visibility ||= Visibility.invisible # Since there are so many, we want them "not suggested", first.
  end

  def uri_must_be_uri
    errors.add('uri', :must_be_uri) unless EOL::Sparql.is_uri?(self.uri)
  end

end